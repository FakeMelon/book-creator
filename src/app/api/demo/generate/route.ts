import { NextResponse } from "next/server";
import OpenAI from "openai";
import { THEMES, PERSONALITY_TRAITS, ILLUSTRATION_STYLES } from "@/constants";

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.STORY_MODEL;

  if (!apiKey || !model) {
    return NextResponse.json(
      { error: "Missing OPENROUTER_API_KEY or STORY_MODEL in .env.local" },
      { status: 500 }
    );
  }

  const input = await req.json();

  const themeConfig = THEMES.find((t) => t.id === input.theme);
  const traitDescriptions = (input.personalityTraits as string[])
    .map((id) => PERSONALITY_TRAITS.find((t) => t.id === id))
    .filter(Boolean)
    .map((t) => `${t!.label} (${t!.storyHint})`)
    .join(", ");
  const styleConfig = ILLUSTRATION_STYLES.find((s) => s.id === input.illustrationStyle);
  const pronouns =
    input.childGender === "girl" ? "she/her" : input.childGender === "boy" ? "he/him" : "they/them";

  const systemPrompt = `You are a world-class children's book author who writes picture books for ages 3-8. You create stories that parents genuinely enjoy reading aloud — with rhythm, humor, heart, and a satisfying narrative arc.

CRITICAL RULES:
- The story MUST feature ${input.childName} (age ${input.childAge}, ${pronouns}) as the main character/protagonist
- Write for a ${input.childAge}-year-old's comprehension level
- Total word count: 500-800 words across all pages
- Use ${input.storyStyle === "RHYME" ? "rhyming verse with consistent meter" : "lyrical prose with occasional repeated refrains"}
- Include a hidden recurring visual motif (like a small butterfly or star) that appears in every illustration description
- The story must have a clear beginning, middle, and satisfying end
- Incorporate at least 2-3 of the child's favorite things naturally into the plot
- The child's personality traits should be evident in how they act in the story
- NO scary content, violence, or anything inappropriate for young children
- DO NOT be preachy or overly moralistic — let lessons emerge naturally from the story

NARRATIVE STRUCTURE:
Use a cumulative or circular structure (common in the best children's books):
- Page 1-4: Setup — introduce ${input.childName} and their world, establish the ordinary day
- Page 5-8: Inciting incident — something unexpected happens that starts the adventure
- Page 9-12: Rising action — encounters challenges, meets friends, discovers things
- Page 13-14: Climax — the big moment where ${input.childName}'s traits shine
- Page 15-16: Resolution — warm, satisfying ending that circles back to the beginning

OUTPUT FORMAT:
Respond with valid JSON only. No markdown, no explanation. The structure must be:
{
  "title": "The Book Title",
  "hiddenMotif": "description of the small recurring visual element",
  "pages": [
    {
      "pageNumber": 1,
      "type": "COVER",
      "text": "The Book Title",
      "illustrationDescription": "Detailed cover illustration description...",
      "textPosition": "overlay"
    },
    {
      "pageNumber": 2,
      "type": "TITLE",
      "text": "The Book Title\\nWritten with love for ${input.childName}",
      "illustrationDescription": "Simple decorative illustration...",
      "textPosition": "center"
    },
    ${input.dedication ? `{
      "pageNumber": 3,
      "type": "DEDICATION",
      "text": "${input.dedication}",
      "illustrationDescription": "Small decorative vignette...",
      "textPosition": "center"
    },` : ""}
    ... (16 illustration pages with type "ILLUSTRATION", covering the full story)
    {
      "pageNumber": 32,
      "type": "BACK_COVER",
      "text": "",
      "illustrationDescription": "Simple pattern with the hidden motif...",
      "textPosition": "bottom"
    }
  ]
}

ILLUSTRATION DESCRIPTIONS:
Each illustrationDescription must be detailed enough for an AI image generator:
- Always describe ${input.childName}'s appearance in the scene
- Specify setting, lighting, mood, key objects
- Reference the illustration style: ${styleConfig?.name}
- Include the hidden motif in each scene
- Describe character expressions and body language`;

  const userPrompt = `Create a children's book with these details:

Child: ${input.childName}, age ${input.childAge}, ${input.childGender}
Personality: ${traitDescriptions}
Favorite things: ${(input.favoriteThings as string[]).join(", ")}
Theme: ${themeConfig?.name} — ${themeConfig?.storyPromptHint}
Story style: ${input.storyStyle === "RHYME" ? "Rhyming verse" : "Prose"}
Illustration style: ${styleConfig?.name} — ${styleConfig?.description}
${input.dedication ? `Dedication: "${input.dedication}"` : "No dedication page"}

Write the complete 32-page book now.`;

  try {
    const client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
    });

    const response = await client.chat.completions.create({
      model,
      max_tokens: 8000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      return NextResponse.json({ error: "Empty response from model" }, { status: 502 });
    }

    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    const story = JSON.parse(cleaned);

    if (!story.title || !story.pages || story.pages.length < 10) {
      return NextResponse.json({ error: "Model returned invalid story structure" }, { status: 502 });
    }

    return NextResponse.json(story);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Demo generation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
