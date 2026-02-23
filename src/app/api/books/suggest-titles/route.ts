import { NextResponse } from "next/server";
import OpenAI from "openai";
import { suggestTitlesSchema } from "@/validators";
import { THEMES } from "@/constants";

const REVIEW_MODEL = process.env.REVIEW_MODEL!;

function getClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY!,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = suggestTitlesSchema.parse(body);

    const themeConfig = THEMES.find((t) => t.id === data.theme);

    const client = getClient();
    const response = await client.chat.completions.create({
      model: REVIEW_MODEL,
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content: `You are a creative children's book title generator. Generate exactly 3 unique, enchanting book title suggestions for a personalized children's book. Titles should be whimsical, age-appropriate, and memorable. Respond with JSON only: { "titles": ["Title One", "Title Two", "Title Three"] }`,
        },
        {
          role: "user",
          content: `Generate 3 title suggestions for a children's book with these details:
Child: ${data.childName}, age ${data.childAge}, ${data.childGender}
Theme: ${themeConfig?.name || data.theme}
Occasion: ${data.occasion}
${data.favoriteThings?.length ? `Favorite things: ${data.favoriteThings.join(", ")}` : ""}
${data.personalityTraits?.length ? `Personality: ${data.personalityTraits.join(", ")}` : ""}
${data.hobbies?.length ? `Hobbies: ${data.hobbies.join(", ")}` : ""}
${data.favoriteCharacters?.length ? `Favorite characters: ${data.favoriteCharacters.join(", ")}` : ""}
${data.favoriteAnimal?.length ? `Favorite animals: ${data.favoriteAnimal.join(", ")}` : ""}

The titles should incorporate the child's name and reflect the theme.`,
        },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      throw new Error("No response from model");
    }

    const cleaned = text
      .replace(/^```(?:json)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();
    const result = JSON.parse(cleaned);

    return NextResponse.json({ titles: result.titles });
  } catch (error) {
    console.error("Suggest titles error:", error);
    return NextResponse.json(
      { error: "Failed to generate title suggestions" },
      { status: 500 }
    );
  }
}
