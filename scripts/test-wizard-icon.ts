/**
 * Test a single wizard icon generation.
 * Usage: npx tsx scripts/test-wizard-icon.ts
 */

import OpenAI from "openai";
import fs from "fs";
import path from "path";

// Load .env.local manually (no dotenv dependency)
const envPath = path.resolve(__dirname, "../.env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let val = trimmed.slice(eq + 1);
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}

const MODEL = "google/gemini-3.1-flash-image-preview";
const OUTPUT_DIR = path.resolve(__dirname, "../public/images/wizard");

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const STYLE = `A single cute 3D clay-rendered icon on a plain white background. Soft matte clay/plasticine texture, rounded smooth forms, warm studio lighting, minimal shadow. No text, no letters, no words. Simple iconic composition, centered.`;

const ICONS = [
  // ─── Themes (9) ───
  {
    id: "theme-adventure",
    prompt: `${STYLE} A rolled-up treasure map with a red X mark and a small compass next to it. Warm earthy brown and gold tones.`,
  },
  {
    id: "theme-friendship",
    prompt: `${STYLE} Two small cute children holding hands, happy smiling faces, one slightly taller than the other. Warm pink and peach pastel tones.`,
  },
  {
    id: "theme-space",
    prompt: `${STYLE} A cute cartoon rocket ship blasting off with small stars and a planet around it. Bright blue, red, and orange colors.`,
  },
  {
    id: "theme-enchanted-forest",
    prompt: `${STYLE} A magical tree with tiny glowing fairy lights and a small door at its base, mushrooms around it. Green and golden tones.`,
  },
  {
    id: "theme-superheroes",
    prompt: `${STYLE} A small superhero cape with a lightning bolt emblem and a tiny mask next to it. Bold red and blue colors.`,
  },
  {
    id: "theme-fairy-tale",
    prompt: `${STYLE} A cute unicorn head with a small golden horn and sparkles around it. Soft purple and pink tones.`,
  },
  {
    id: "theme-robots",
    prompt: `${STYLE} A cute friendly small robot with round eyes, antenna, and a happy waving expression. Silver and blue tones.`,
  },
  {
    id: "theme-underwater",
    prompt: `${STYLE} A cute colorful tropical fish with bubbles around it and a small piece of coral. Blue and orange tones.`,
  },
  {
    id: "theme-dinosaurs",
    prompt: `${STYLE} A cute small friendly green brontosaurus dinosaur with a happy smile. Green and earthy warm tones.`,
  },

  // ─── Occasions (5) ───
  {
    id: "occasion-birthday",
    prompt: `${STYLE} A cute birthday cake with colorful candles lit and small confetti pieces around it. Bright festive pink, yellow, and blue colors.`,
  },
  {
    id: "occasion-holiday",
    prompt: `${STYLE} A small decorated Christmas tree with a star on top and tiny wrapped presents underneath. Green, red, and gold tones.`,
  },
  {
    id: "occasion-just-because",
    prompt: `${STYLE} A glowing magical star with sparkle trails radiating outward, whimsical and enchanting. Warm golden and purple tones.`,
  },
  {
    id: "occasion-achievement",
    prompt: `${STYLE} A shiny golden trophy cup with a small star on top. Bright gold and warm tones.`,
  },
  {
    id: "occasion-new-sibling",
    prompt: `${STYLE} A cute small baby wrapped in a soft blanket inside a bassinet with a small heart above. Soft pink and blue pastel tones.`,
  },

  // ─── Illustration Styles (12) ───
  {
    id: "style-watercolor",
    prompt: `${STYLE} A small artist's palette with soft watercolor paint splotches dripping gently, a thin paintbrush resting on it. Dreamy pastel watercolor tones.`,
  },
  {
    id: "style-soft-anime",
    prompt: `${STYLE} A cute chibi anime character face with big sparkly eyes and a small star accessory. Soft pastel pink and lavender tones.`,
  },
  {
    id: "style-paper-collage",
    prompt: `${STYLE} Pieces of colorful torn paper arranged into the shape of a small bird, craft scissors nearby. Textured multi-color paper tones.`,
  },
  {
    id: "style-playful-3d",
    prompt: `${STYLE} A cute 3D teddy bear with smooth glossy plastic texture, Pixar-style rounded look. Bright cheerful warm colors.`,
  },
  {
    id: "style-gouache",
    prompt: `${STYLE} A small paint tube squeezing thick opaque paint and a wide flat brush with rich visible strokes. Warm earthy gouache tones.`,
  },
  {
    id: "style-claymation",
    prompt: `${STYLE} A tiny clay figure of a cat with visible fingerprint textures on its clay surface, handmade look. Warm terracotta and earth colors.`,
  },
  {
    id: "style-geometric",
    prompt: `${STYLE} A small bird made of clean geometric shapes — triangles, circles, and rectangles. Bold flat color blocks, mid-century modern palette.`,
  },
  {
    id: "style-picture-book",
    prompt: `${STYLE} A small open storybook with hand-drawn illustrations visible on its pages, a quill pen beside it. Warm nostalgic golden tones.`,
  },
  {
    id: "style-block-craft",
    prompt: `${STYLE} A small blocky voxel-style house made of cubic blocks, Minecraft-inspired. Bright primary colors.`,
  },
  {
    id: "style-kawaii",
    prompt: `${STYLE} A super cute kawaii cupcake with a happy smiling face, sparkles and tiny stars around it. Pastel rainbow colors.`,
  },
  {
    id: "style-comic-pop",
    prompt: `${STYLE} A comic-style explosion burst shape with bold outlines and a small fist inside. Bold saturated red, yellow, and blue with halftone dots.`,
  },
  {
    id: "style-sticker-art",
    prompt: `${STYLE} A cute rainbow with a white die-cut sticker outline border, glossy vinyl look. Bright flat cheerful colors.`,
  },
];

async function generateIcon(icon: { id: string; prompt: string }) {
  const filepath = path.join(OUTPUT_DIR, `${icon.id}.png`);
  console.log(`🎨 Generating ${icon.id}...`);

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: icon.prompt }],
    // @ts-expect-error -- OpenRouter extends OpenAI API
    modalities: ["image", "text"],
    image_config: { aspect_ratio: "1:1", image_size: "1K" },
  });

  const message = response.choices[0]?.message;
  let dataUrl: string | undefined;

  if (message && "images" in message && Array.isArray((message as any).images)) {
    const img = (message as any).images[0];
    if (typeof img === "string") dataUrl = img;
    else if (img?.image_url?.url) dataUrl = img.image_url.url;
    else if (img?.b64_json) dataUrl = `data:image/png;base64,${img.b64_json}`;
  }
  if (!dataUrl && message?.content?.startsWith("data:image")) {
    dataUrl = message.content;
  }

  if (!dataUrl) {
    console.error(`❌ No image for ${icon.id}`);
    return;
  }

  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  fs.writeFileSync(filepath, Buffer.from(base64, "base64"));
  console.log(`✅ ${icon.id}`);
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Model: ${MODEL}\n`);

  // Generate 2 at a time
  for (let i = 0; i < ICONS.length; i += 2) {
    await Promise.all(ICONS.slice(i, i + 2).map(generateIcon));
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
