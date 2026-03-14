import { config } from "dotenv";
config({ path: ".env.local" });

import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import type { ThemeConfig, IllustrationStyleConfig } from "../src/types";

// ─── Predefined examples ───

interface CoverExample {
  name: string;
  age: number;
  gender: string;
  themeId: string;
  styleId: string;
  title: string;
}

const PREDEFINED: CoverExample[] = [
  {
    name: "Luna",
    age: 5,
    gender: "girl",
    themeId: "space",
    styleId: "WATERCOLOR",
    title: "Luna's Cosmic Birthday Adventure",
  },
  {
    name: "Marcus",
    age: 7,
    gender: "boy",
    themeId: "enchanted-forest",
    styleId: "COMIC_POP",
    title: "Marcus and the Enchanted Forest",
  },
  {
    name: "River",
    age: 4,
    gender: "non-binary child",
    themeId: "underwater",
    styleId: "GOUACHE_PAINTERLY",
    title: "River's Undersea Discovery",
  },
];

// ─── Random generation pools ───

const RANDOM_NAMES = [
  "Aria", "Theo", "Zara", "Milo", "Nova", "Felix", "Ivy", "Leo",
  "Maya", "Kai", "Willow", "Oscar", "Stella", "Jasper", "Ruby", "Finn",
  "Olive", "Atlas", "Cleo", "Hugo",
];

const RANDOM_GENDERS = ["girl", "boy", "non-binary child"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomExample(
  themes: ThemeConfig[],
  styles: IllustrationStyleConfig[]
): CoverExample {
  const name = randomFrom(RANDOM_NAMES);
  const age = 3 + Math.floor(Math.random() * 6); // 3-8
  const gender = randomFrom(RANDOM_GENDERS);
  const theme = randomFrom(themes);
  const style = randomFrom(styles);
  return {
    name,
    age,
    gender,
    themeId: theme.id,
    styleId: style.id,
    title: `${name}'s ${theme.id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} Adventure`,
  };
}

// ─── Prompt builder ───

function buildCoverPrompt(
  example: CoverExample,
  themes: ThemeConfig[],
  styles: IllustrationStyleConfig[]
): string {
  const theme = themes.find((t) => t.id === example.themeId);
  const style = styles.find((s) => s.id === example.styleId);

  if (!theme || !style) {
    throw new Error(`Invalid theme "${example.themeId}" or style "${example.styleId}"`);
  }

  return [
    `A vibrant full-bleed square illustration for a children's book cover — the artwork must fill the entire canvas edge to edge with absolutely no borders, margins, or white space.`,
    `Featuring a ${example.age}-year-old ${example.gender} character named ${example.name}.`,
    `The theme is ${example.themeId.replace(/-/g, " ")} — ${theme.storyPromptHint}.`,
    `The scene should be inviting, magical, and capture the essence of the story.`,
    `Leave a clear, uncluttered area at the top ~25% for title text overlay.`,
    `STRICTLY FORBIDDEN: no text, no letters, no words, no numbers, no writing, no signs, no labels anywhere in the image — the title will be added digitally later.`,
    style.fluxStylePrompt + ".",
    `Eye-catching children's book cover, professional quality, vibrant and inviting. The background and scene must extend fully to every edge of the square canvas.`,
  ].join(" ");
}

// ─── Main ───

async function main() {
  if (!process.env.IMAGE_MODEL) {
    throw new Error("IMAGE_MODEL environment variable is not set. Ensure .env.local exists and contains IMAGE_MODEL=<model-id>");
  }
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set. Ensure .env.local exists and contains OPENROUTER_API_KEY=<key>");
  }

  // Dynamic import so env vars are loaded before module-scope reads in image-gen.ts
  const { generateImage, dataUrlToBuffer } = await import("../src/lib/image-gen");
  const { THEMES, ILLUSTRATION_STYLES } = await import("../src/constants");
  const { generateBookMockup } = await import("../src/lib/book-mockup");

  const countArg = parseInt(process.argv[2] || "0", 10);
  const count = countArg > 0 ? countArg : PREDEFINED.length;

  // Build example list
  const examples: CoverExample[] = [];
  for (let i = 0; i < count; i++) {
    if (i < PREDEFINED.length) {
      examples.push(PREDEFINED[i]);
    } else {
      examples.push(generateRandomExample(THEMES, ILLUSTRATION_STYLES));
    }
  }

  const outDir = join(process.cwd(), "examples", "covers");
  await mkdir(outDir, { recursive: true });

  console.log(`Generating ${examples.length} example cover(s)...`);
  console.log(`Model: ${process.env.IMAGE_MODEL}`);
  console.log(`Size: ${process.env.IMAGE_SIZE || "1K"}\n`);

  const totalStart = Date.now();

  for (let i = 0; i < examples.length; i++) {
    const ex = examples[i];
    const slug = `${ex.name.toLowerCase()}-${ex.themeId}-${ex.styleId.toLowerCase().replace(/_/g, "-")}`;
    const filename = `${slug}.png`;

    console.log(`[${i + 1}/${examples.length}] ${ex.title}`);
    console.log(`  Theme: ${ex.themeId} | Style: ${ex.styleId} | ${ex.name}, age ${ex.age}, ${ex.gender}`);

    const prompt = buildCoverPrompt(ex, THEMES, ILLUSTRATION_STYLES);
    const start = Date.now();

    const dataUrl = await generateImage(prompt);
    const buffer = dataUrlToBuffer(dataUrl);

    const filePath = join(outDir, filename);
    await writeFile(filePath, buffer);

    // Generate 3D book mockup
    const mockupBuffer = await generateBookMockup(buffer);
    const mockupPath = join(outDir, `${slug}-mockup.png`);
    await writeFile(mockupPath, mockupBuffer);

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);
    console.log(`  Done in ${elapsed}s — ${filePath} (${sizeMB} MB)`);
    console.log(`  Mockup: ${mockupPath}\n`);
  }

  const totalElapsed = ((Date.now() - totalStart) / 1000).toFixed(1);
  console.log(`All done in ${totalElapsed}s`);
  console.log(`Check exact cost at: https://openrouter.ai/activity`);
}

main().catch((err) => {
  console.error("Fatal error generating example covers:", err);
  process.exit(1);
});
