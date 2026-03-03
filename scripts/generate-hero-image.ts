import { config } from "dotenv";
config({ path: ".env.local" });

import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const HERO_IMAGES = [
  {
    name: "hero-desktop",
    aspectRatio: "16:9",
    prompt: [
      "A warm, inviting children's book illustration of a mother bending down and handing a beautifully illustrated hardcover picture book to her ~5-year-old child who is sitting cross-legged on a cozy rug.",
      "The child looks at the book with wide-eyed wonder and excitement. On the book's cover, the child appears as a storybook character.",
      "Cozy living room setting with soft warm golden-hour light streaming through a window, bookshelves in the background, plush cushions, and a gentle magical sparkle around the book.",
      "The bottom ~30% of the image should be slightly darker or have open space suitable for text overlay.",
      "Rendered in a soft, dreamy watercolor children's book illustration style with gentle color blending, warm tones of amber, rose, and cream.",
      "Professional quality, vibrant yet gentle colors. STRICTLY FORBIDDEN: no text, no letters, no words, no numbers, no writing, no signs anywhere in the image.",
    ].join(" "),
  },
  {
    name: "hero-mobile",
    aspectRatio: "3:4",
    prompt: [
      "A warm, inviting children's book illustration of a mother bending down and handing a beautifully illustrated hardcover picture book to her ~5-year-old child who is sitting cross-legged on a cozy rug.",
      "The child looks at the book with wide-eyed wonder and excitement. On the book's cover, the child appears as a storybook character.",
      "Vertical composition, close framing on the mother and child. Cozy living room with soft warm golden-hour light, gentle magical sparkle around the book.",
      "The bottom ~30% of the image should be slightly darker or have open space suitable for text overlay.",
      "Rendered in a soft, dreamy watercolor children's book illustration style with gentle color blending, warm tones of amber, rose, and cream.",
      "Professional quality, vibrant yet gentle colors. STRICTLY FORBIDDEN: no text, no letters, no words, no numbers, no writing, no signs anywhere in the image.",
    ].join(" "),
  },
] as const;

async function main() {
  if (!process.env.IMAGE_MODEL) {
    throw new Error(
      "IMAGE_MODEL environment variable is not set. Ensure .env.local exists and contains IMAGE_MODEL=<model-id>"
    );
  }
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY environment variable is not set. Ensure .env.local exists and contains OPENROUTER_API_KEY=<key>"
    );
  }

  // Dynamic import so env vars are loaded before module-scope reads in image-gen.ts
  const { generateImage, dataUrlToBuffer } = await import(
    "../src/lib/image-gen"
  );

  const outDir = join(process.cwd(), "public", "images", "hero");
  await mkdir(outDir, { recursive: true });

  console.log(`Generating ${HERO_IMAGES.length} hero image(s)...`);
  console.log(`Model: ${process.env.IMAGE_MODEL}`);
  console.log(`Size: ${process.env.IMAGE_SIZE || "1K"}\n`);

  const totalStart = Date.now();

  for (const img of HERO_IMAGES) {
    console.log(`Generating ${img.name} (${img.aspectRatio})...`);
    const start = Date.now();

    const dataUrl = await generateImage(img.prompt, undefined, {
      aspectRatio: img.aspectRatio,
    });
    const buffer = dataUrlToBuffer(dataUrl);

    const filePath = join(outDir, `${img.name}.png`);
    await writeFile(filePath, buffer);

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const sizeMB = (buffer.length / 1024 / 1024).toFixed(1);
    console.log(`  Done in ${elapsed}s — ${filePath} (${sizeMB} MB)\n`);
  }

  const totalElapsed = ((Date.now() - totalStart) / 1000).toFixed(1);
  console.log(`All done in ${totalElapsed}s`);
  console.log(`Check exact cost at: https://openrouter.ai/activity`);
}

main().catch((err) => {
  console.error("Fatal error generating hero images:", err);
  process.exit(1);
});
