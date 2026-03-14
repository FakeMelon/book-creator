/**
 * Generate cute 3D clay-style wizard icons using Gemini via OpenRouter.
 *
 * Usage:
 *   npx tsx scripts/generate-wizard-icons.ts
 *
 * Requires OPENROUTER_API_KEY in .env.local
 */

import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const OUTPUT_DIR = path.resolve(__dirname, "../public/images/wizard");
const MODEL = "google/gemini-2.0-flash-exp:free";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const STYLE_PREFIX =
  "A single cute 3D clay-rendered icon on a plain white background. Soft matte clay/plasticine texture, rounded smooth forms, warm studio lighting, minimal shadow. No text, no letters, no words. Simple iconic composition, centered.";

// ─── All icons to generate ───

interface IconDef {
  category: string;
  id: string;
  prompt: string;
}

const ICONS: IconDef[] = [
  // Age Ranges
  {
    category: "age",
    id: "0-2",
    prompt: `${STYLE_PREFIX} A cute baby sitting and holding an open picture book, pacifier, tiny, chubby cheeks. Warm pastel colors.`,
  },
  {
    category: "age",
    id: "3-5",
    prompt: `${STYLE_PREFIX} A small cheerful preschool boy sitting cross-legged reading an open book, curious expression, simple clothes. Warm colors.`,
  },
  {
    category: "age",
    id: "6-9",
    prompt: `${STYLE_PREFIX} A young girl with braids sitting and reading a book with interest, slightly older child, focused expression. Warm colors.`,
  },
  {
    category: "age",
    id: "10-plus",
    prompt: `${STYLE_PREFIX} A confident older child wearing headphones around neck, reading a book, relaxed cool pose. Warm colors.`,
  },

  // Themes
  {
    category: "theme",
    id: "adventure",
    prompt: `${STYLE_PREFIX} A rolled-up treasure map with a red X mark and a small compass next to it. Warm earthy tones.`,
  },
  {
    category: "theme",
    id: "friendship",
    prompt: `${STYLE_PREFIX} Two small cute characters (a child and a different child) holding hands, happy smiling faces. Warm pastel tones.`,
  },
  {
    category: "theme",
    id: "space",
    prompt: `${STYLE_PREFIX} A cute cartoon rocket ship blasting off with small stars around it. Bright vibrant colors.`,
  },
  {
    category: "theme",
    id: "enchanted-forest",
    prompt: `${STYLE_PREFIX} A magical forest tree with tiny glowing fairy lights and a small door at its base, mushrooms around. Green and golden tones.`,
  },
  {
    category: "theme",
    id: "superheroes",
    prompt: `${STYLE_PREFIX} A small superhero cape with a lightning bolt emblem and a tiny mask. Bold red and blue colors.`,
  },
  {
    category: "theme",
    id: "fairy-tale",
    prompt: `${STYLE_PREFIX} A cute unicorn head with a small golden horn and sparkles around it. Soft purple and pink tones.`,
  },
  {
    category: "theme",
    id: "robots",
    prompt: `${STYLE_PREFIX} A cute friendly small robot with round eyes, antenna, and a happy expression. Silver and blue tones.`,
  },
  {
    category: "theme",
    id: "underwater",
    prompt: `${STYLE_PREFIX} A cute colorful tropical fish with bubbles around it and a small piece of coral. Blue and orange tones.`,
  },
  {
    category: "theme",
    id: "dinosaurs",
    prompt: `${STYLE_PREFIX} A cute small friendly green brontosaurus dinosaur with a happy smile. Green and earthy tones.`,
  },

  // Occasions
  {
    category: "occasion",
    id: "birthday",
    prompt: `${STYLE_PREFIX} A cute birthday cake with colorful candles and small confetti pieces around it. Bright festive colors.`,
  },
  {
    category: "occasion",
    id: "holiday",
    prompt: `${STYLE_PREFIX} A small decorated Christmas tree with a star on top and tiny presents underneath. Green, red, and gold tones.`,
  },
  {
    category: "occasion",
    id: "just-because",
    prompt: `${STYLE_PREFIX} A glowing magical star with sparkle trails, whimsical and enchanting. Warm golden and purple tones.`,
  },
  {
    category: "occasion",
    id: "achievement",
    prompt: `${STYLE_PREFIX} A shiny golden trophy cup with a small star on top. Bright gold and warm tones.`,
  },
  {
    category: "occasion",
    id: "new-sibling",
    prompt: `${STYLE_PREFIX} A cute small baby wrapped in a blanket inside a bassinet with a small heart. Soft pink and blue pastel tones.`,
  },

  // Illustration Styles — each shows a mini "sample" of that art style
  {
    category: "style",
    id: "WATERCOLOR",
    prompt: `${STYLE_PREFIX} A small artist's palette with watercolor paint splotches dripping softly, a thin paintbrush. Dreamy pastel watercolor tones.`,
  },
  {
    category: "style",
    id: "SOFT_ANIME",
    prompt: `${STYLE_PREFIX} A cute chibi anime character face with big sparkly eyes and a small star. Soft pastel anime tones.`,
  },
  {
    category: "style",
    id: "PAPER_COLLAGE",
    prompt: `${STYLE_PREFIX} Pieces of colorful torn paper arranged into the shape of a small bird, craft scissors nearby. Textured paper colors.`,
  },
  {
    category: "style",
    id: "PLAYFUL_3D",
    prompt: `${STYLE_PREFIX} A cute 3D teddy bear with smooth plastic/rubber texture, Pixar-style glossy look. Bright cheerful colors.`,
  },
  {
    category: "style",
    id: "GOUACHE_PAINTERLY",
    prompt: `${STYLE_PREFIX} A small paint tube squeezing thick opaque paint and a wide brush with rich strokes. Warm earthy gouache tones.`,
  },
  {
    category: "style",
    id: "CLAYMATION",
    prompt: `${STYLE_PREFIX} A tiny clay figure of a cat with visible fingerprint textures on the clay surface. Warm clay and terracotta colors.`,
  },
  {
    category: "style",
    id: "GEOMETRIC_MODERN",
    prompt: `${STYLE_PREFIX} A small bird made of clean geometric shapes — triangles and circles. Bold flat color blocks, mid-century modern palette.`,
  },
  {
    category: "style",
    id: "PICTURE_BOOK",
    prompt: `${STYLE_PREFIX} A small open storybook with hand-drawn illustrations visible on its pages, a quill pen beside it. Warm nostalgic tones.`,
  },
  {
    category: "style",
    id: "BLOCK_CRAFT",
    prompt: `${STYLE_PREFIX} A small blocky voxel-style house made of cubic blocks, Minecraft-inspired. Bright primary colors.`,
  },
  {
    category: "style",
    id: "KAWAII",
    prompt: `${STYLE_PREFIX} A super cute kawaii cupcake with a happy face, sparkles and tiny stars around it. Pastel rainbow colors.`,
  },
  {
    category: "style",
    id: "COMIC_POP",
    prompt: `${STYLE_PREFIX} A comic-style "POW" explosion burst shape with a small fist. Bold saturated colors with halftone dots.`,
  },
  {
    category: "style",
    id: "STICKER_ART",
    prompt: `${STYLE_PREFIX} A cute rainbow sticker with a white die-cut outline border, glossy vinyl look. Bright flat sticker colors.`,
  },
];

// ─── Generate ───

async function generateIcon(icon: IconDef): Promise<void> {
  const filename = `${icon.category}-${icon.id.toLowerCase()}.webp`;
  const filepath = path.join(OUTPUT_DIR, filename);

  if (fs.existsSync(filepath)) {
    console.log(`⏭️  Skipping ${filename} (already exists)`);
    return;
  }

  console.log(`🎨 Generating ${filename}...`);

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: icon.prompt }],
      // @ts-expect-error -- OpenRouter extends OpenAI API
      modalities: ["image", "text"],
      image_config: {
        aspect_ratio: "1:1",
        image_size: "1K",
      },
    });

    const message = response.choices[0]?.message;
    let dataUrl: string | undefined;

    // OpenRouter returns images in message.images
    if (message && "images" in message && Array.isArray((message as any).images)) {
      const img = (message as any).images[0];
      if (typeof img === "string") dataUrl = img;
      else if (img?.image_url?.url) dataUrl = img.image_url.url;
      else if (img?.b64_json) dataUrl = `data:image/png;base64,${img.b64_json}`;
    }

    // Some models return data URL in content
    if (!dataUrl && message?.content?.startsWith("data:image")) {
      dataUrl = message.content;
    }

    if (!dataUrl) {
      console.error(`❌ No image returned for ${filename}`);
      console.error("   Response:", JSON.stringify(message, null, 2).slice(0, 500));
      return;
    }

    // Strip data URL prefix and save as binary
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    fs.writeFileSync(filepath, Buffer.from(base64, "base64"));
    console.log(`✅ Saved ${filename}`);
  } catch (err: any) {
    console.error(`❌ Failed ${filename}: ${err.message}`);
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\nGenerating ${ICONS.length} wizard icons...\n`);
  console.log(`Model: ${MODEL}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  // Generate 2 at a time to avoid rate limits
  for (let i = 0; i < ICONS.length; i += 2) {
    const batch = ICONS.slice(i, i + 2);
    await Promise.all(batch.map(generateIcon));
  }

  console.log("\n🎉 Done! Generated icons are in public/images/wizard/");
}

main().catch(console.error);
