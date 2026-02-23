import OpenAI from "openai";
import type { GeneratedStory, StoryStyle, IllustrationStyle } from "@/types";
import { THEMES, PERSONALITY_TRAITS, ILLUSTRATION_STYLES } from "@/constants";

function getClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY!,
  });
}

const STORY_MODEL = process.env.STORY_MODEL!;
const REVIEW_MODEL = process.env.REVIEW_MODEL!;

interface AdditionalCharacterInput {
  name: string;
  role: string;
  photoUrl?: string | null;
}

interface StoryGenerationInput {
  childName: string;
  childAge: number;
  childGender: string;
  favoriteThings: string[];
  personalityTraits: string[];
  theme: string;
  storyStyle: StoryStyle;
  illustrationStyle: IllustrationStyle;
  dedication?: string;
  occasion?: string;
  hobbies?: string[];
  favoriteCharacters?: string[];
  favoriteAnimal?: string[];
  additionalCharacters?: AdditionalCharacterInput[];
  title?: string;
}

export async function generateStory(input: StoryGenerationInput): Promise<GeneratedStory> {
  const themeConfig = THEMES.find((t) => t.id === input.theme);
  const traitDescriptions = input.personalityTraits
    .map((id) => {
      const preset = PERSONALITY_TRAITS.find((t) => t.id === id);
      return preset ? `${preset.label} (${preset.storyHint})` : id;
    })
    .join(", ");
  const styleConfig = ILLUSTRATION_STYLES.find((s) => s.id === input.illustrationStyle);
  const pronouns = input.childGender === "girl" ? "she/her" : input.childGender === "boy" ? "he/him" : "they/them";

  // Build additional characters section
  let additionalCharactersPrompt = "";
  if (input.additionalCharacters && input.additionalCharacters.length > 0) {
    const charDescriptions = input.additionalCharacters
      .map((c) => `- ${c.name} (${c.role})`)
      .join("\n");
    additionalCharactersPrompt = `\n\nADDITIONAL CHARACTERS TO INCLUDE IN THE STORY:\n${charDescriptions}\nWeave these characters naturally into the story. They should have meaningful interactions with ${input.childName}.`;
  }

  // Build occasion context
  const occasionContext = input.occasion
    ? `\nThe occasion for this book is: ${input.occasion}. Subtly reflect this context in the story.`
    : "";

  // Build hobbies/interests context
  let interestsContext = "";
  if (input.hobbies?.length) {
    interestsContext += `\nHobbies: ${input.hobbies.join(", ")} — incorporate these naturally as activities ${input.childName} enjoys.`;
  }
  if (input.favoriteCharacters?.length) {
    interestsContext += `\nFavorite characters/heroes: ${input.favoriteCharacters.join(", ")} — weave references or similar archetypes into the story.`;
  }
  if (input.favoriteAnimal?.length) {
    interestsContext += `\nFavorite animals: ${input.favoriteAnimal.join(", ")} — include as companions, friends, or story elements.`;
  }

  // Title instruction
  const titleInstruction = input.title
    ? `\nIMPORTANT: The book title MUST be "${input.title}". Use this exact title in the output.`
    : "";

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
- DO NOT be preachy or overly moralistic — let lessons emerge naturally from the story${titleInstruction}${occasionContext}${interestsContext}${additionalCharactersPrompt}

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
  "title": "${input.title || "The Book Title"}",
  "hiddenMotif": "description of the small recurring visual element",
  "pages": [
    {
      "pageNumber": 1,
      "type": "COVER",
      "text": "The Book Title",
      "illustrationDescription": "Detailed cover illustration description showing ${input.childName}...",
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
    ... (illustration pages with type "ILLUSTRATION")
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
Each illustrationDescription must be detailed enough for an AI image generator to produce a consistent scene:
- Always mention ${input.childName} by describing their appearance in the scene
- Specify the setting, lighting, mood, and key objects
- Reference the illustration style: ${styleConfig?.name}
- Include the hidden motif somewhere in each scene
- Describe character expressions and body language
- Keep scenes visually diverse — vary settings, compositions, and color palettes`;

  const userPrompt = `Create a children's book with these details:

Child: ${input.childName}, age ${input.childAge}, ${input.childGender}
Personality: ${traitDescriptions}
Favorite things: ${input.favoriteThings.join(", ")}
Theme: ${themeConfig?.name} — ${themeConfig?.storyPromptHint}
Story style: ${input.storyStyle === "RHYME" ? "Rhyming verse" : "Prose"}
Illustration style: ${styleConfig?.name} — ${styleConfig?.description}
${input.occasion ? `Occasion: ${input.occasion}` : ""}
${input.hobbies?.length ? `Hobbies: ${input.hobbies.join(", ")}` : ""}
${input.favoriteCharacters?.length ? `Favorite characters: ${input.favoriteCharacters.join(", ")}` : ""}
${input.favoriteAnimal?.length ? `Favorite animals: ${input.favoriteAnimal.join(", ")}` : ""}
${input.additionalCharacters?.length ? `Additional characters: ${input.additionalCharacters.map((c) => `${c.name} (${c.role})`).join(", ")}` : ""}
${input.dedication ? `Dedication: "${input.dedication}"` : "No dedication page"}
${input.title ? `Title: "${input.title}"` : ""}

Write the complete 32-page book now.`;

  const client = getClient();
  const response = await client.chat.completions.create({
    model: STORY_MODEL,
    max_tokens: 8000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    throw new Error("No content in OpenRouter response");
  }

  // Strip markdown fences if the model wraps JSON in ```json ... ```
  const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  const story: GeneratedStory = JSON.parse(cleaned);

  // Validate story structure
  if (!story.title || !story.pages || story.pages.length < 16) {
    throw new Error("Invalid story structure from model");
  }

  // Calculate word count
  story.wordCount = story.pages.reduce((total, page) => {
    return total + (page.text?.split(/\s+/).length || 0);
  }, 0);

  return story;
}

export async function reviewStorySafety(story: GeneratedStory): Promise<{
  approved: boolean;
  issues: string[];
}> {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: REVIEW_MODEL,
    max_tokens: 1000,
    messages: [
      {
        role: "system",
        content: `You are a children's content safety reviewer. Review the following children's book for:
1. Age-appropriateness (target: ages 3-8)
2. Any scary, violent, or inappropriate content
3. Gender stereotypes or bias
4. Cultural sensitivity issues
5. Quality of writing (is it engaging and well-written?)

Respond with JSON only:
{ "approved": true/false, "issues": ["issue1", "issue2"] }

Be strict on safety but reasonable on creative quality. Minor imperfections in writing are acceptable. Only flag genuine safety or quality concerns.`,
      },
      {
        role: "user",
        content: `Review this children's book:\n\nTitle: ${story.title}\n\n${story.pages
          .map((p) => `Page ${p.pageNumber}: ${p.text}`)
          .join("\n")}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content;
  if (!text) {
    return { approved: true, issues: [] };
  }

  const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  return JSON.parse(cleaned);
}
