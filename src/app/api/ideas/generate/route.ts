import { NextResponse } from "next/server";
import OpenAI from "openai";
import { isDemoMode } from "@/lib/config";
import { auth } from "@/lib/auth";
import { generateIdeasSchema } from "@/validators";
import { THEMES, PERSONALITY_TRAITS } from "@/constants";
import type { BookIdea } from "@/types";

function getClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY!,
  });
}

const STORY_MODEL = process.env.STORY_MODEL!;

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
    const traitDescriptions = data.personalityTraits
      .map((id) => {
        const preset = PERSONALITY_TRAITS.find((t) => t.id === id);
        return preset ? `${preset.label} (${preset.storyHint})` : id;
      })
      .join(", ");
    const pronouns =
      data.childGender === "girl" ? "she/her" : data.childGender === "boy" ? "he/him" : "they/them";

    const systemPrompt = `You are a children's book author who brainstorms creative book concepts for ages 3-8. Given details about a child, generate exactly 3 unique book ideas. Each idea should have a catchy, age-appropriate title and a 1-2 sentence description of what the story is about.

Return valid JSON only, no markdown. The structure must be:
{ "ideas": [{ "title": "...", "description": "..." }, ...] }

Rules:
- Each title must include the child's name
- Each description should be 15-30 words
- Make each idea distinctly different in plot and tone
- Descriptions should excite both the child and their parents
- NO scary or inappropriate content`;

    const userPrompt = `Child: ${data.childName}, age ${data.childAge}, ${data.childGender} (${pronouns})
Personality: ${traitDescriptions}
Theme: ${themeConfig?.name} — ${themeConfig?.storyPromptHint}
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

    const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.ideas || !Array.isArray(parsed.ideas) || parsed.ideas.length < 3) {
      throw new Error("Invalid ideas structure from model");
    }

    const ideas: BookIdea[] = parsed.ideas.slice(0, 3).map((idea: { title?: string; description?: string }) => ({
      title: String(idea.title || ""),
      description: String(idea.description || ""),
    }));

    return NextResponse.json({ ideas });
  } catch (err) {
    console.error("Failed to generate book ideas:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate ideas" },
      { status: 500 }
    );
  }
}
