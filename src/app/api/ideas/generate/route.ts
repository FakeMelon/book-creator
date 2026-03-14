import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/config";
import { auth } from "@/lib/auth";
import { getClient, STORY_MODEL, LANGUAGE_NAMES } from "@/lib/claude";
import { generateIdeasSchema } from "@/validators";
import { THEMES, PERSONALITY_TRAITS, AGE_RANGE_OPTIONS } from "@/constants";
import { getThemeName, getTraitLabel, getSubjectName, getStoryHeartName } from "@/lib/constant-labels";
import type { BookIdea } from "@/types";

export async function POST(req: Request) {
  if (!isDemoMode) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const body = await req.json();
    const data = generateIdeasSchema.parse(body);

    const themeConfig = THEMES.find((t) => t.id === data.theme);
    if (!themeConfig) {
      return NextResponse.json(
        { error: "Unknown theme. Please go back and select a valid theme." },
        { status: 400 }
      );
    }

    const traitDescriptions = data.personalityTraits
      .map((id) => {
        const preset = PERSONALITY_TRAITS.find((t) => t.id === id);
        return preset ? `${getTraitLabel(preset.id)} (${preset.storyHint})` : id;
      })
      .join(", ");
    const pronouns =
      data.childGender === "girl" ? "she/her" : data.childGender === "boy" ? "he/him" : "they/them";

    const lang = data.language || "en";
    const langInstruction = lang !== "en"
      ? `\nIMPORTANT: Write all titles and descriptions in ${LANGUAGE_NAMES[lang] || lang}. The child's name should remain as-is.`
      : "";

    const ageConfig = AGE_RANGE_OPTIONS.find((a) => a.id === data.childAge);
    const ageLabel = ageConfig?.label ?? data.childAge;

    const subjectLine = data.subject && data.theme
      ? `\nSubject: ${getSubjectName(data.theme, data.subject)}`
      : "";
    const heartLine = data.storyMessage
      ? `\nHeart of the story: ${getStoryHeartName(data.storyMessage)}`
      : "";

    const systemPrompt = `You are a children's book author who brainstorms creative book concepts. Given details about a child, generate exactly 3 unique book ideas. Each idea should have a catchy, age-appropriate title and a 1-2 sentence description of what the story is about.

Return valid JSON only, no markdown. The structure must be:
{ "ideas": [{ "title": "...", "description": "..." }, ...] }

Rules:
- Each title must include the child's name
- Each description should be 15-30 words
- Make each idea distinctly different in plot and tone
- Descriptions should excite both the child and their parents
- NO scary or inappropriate content${langInstruction}`;

    const userPrompt = `Child: ${data.childName}, age range ${ageLabel}, ${data.childGender} (${pronouns})
Personality: ${traitDescriptions}
Theme: ${getThemeName(themeConfig.id)} — ${themeConfig.storyPromptHint}${subjectLine}${heartLine}
Story style: ${data.storyStyle === "RHYME" ? "Rhyming verse" : "Prose"}
Occasion: ${data.occasion}
${data.hobbies?.length ? `Hobbies: ${data.hobbies.join(", ")}` : ""}
${data.favoriteCharacters?.length ? `Favorite characters: ${data.favoriteCharacters.join(", ")}` : ""}
${data.favoriteAnimal?.length ? `Favorite animals: ${data.favoriteAnimal.join(", ")}` : ""}
${data.favoriteFoods?.length ? `Favorite foods: ${data.favoriteFoods.join(", ")}` : ""}

Generate 3 unique book ideas now.`;

    const client = getClient();
    const response = await client.chat.completions.create({
      model: STORY_MODEL,
      max_tokens: 500,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("No content in OpenRouter response");
    }

    // Defensive: strip markdown fences even though prompt says not to — models sometimes ignore instructions
    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.ideas || !Array.isArray(parsed.ideas) || parsed.ideas.length < 3) {
      throw new Error("Invalid ideas structure from model");
    }

    const ideas: BookIdea[] = parsed.ideas
      .filter((idea: Record<string, unknown>) => {
        return typeof idea.title === "string" && idea.title.trim().length > 0
          && typeof idea.description === "string" && idea.description.trim().length > 0;
      })
      .slice(0, 3)
      .map((idea: { title: string; description: string }) => ({
        title: idea.title.trim(),
        description: idea.description.trim(),
      }));

    if (ideas.length < 3) {
      throw new Error("Model returned incomplete ideas");
    }

    return NextResponse.json({ ideas });
  } catch (err) {
    console.error("Failed to generate book ideas:", err);
    return NextResponse.json(
      { error: "Failed to generate ideas. Please try again." },
      { status: 500 }
    );
  }
}
