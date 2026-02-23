import { config } from "dotenv";
config({ path: ".env.local" });
import OpenAI from "openai";

async function main() {
  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY!,
  });

  const model = process.env.IMAGE_MODEL || "black-forest-labs/flux.2-pro";
  const size = process.env.IMAGE_SIZE || "1K";

  console.log(`Model: ${model}`);
  console.log(`Size: ${size}`);
  console.log("Generating one test image...\n");

  const start = Date.now();

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "user",
        content: "A happy cartoon cat sitting on a rainbow, children's book illustration style, vibrant colors",
      },
    ],
    // @ts-expect-error -- OpenRouter extends the OpenAI API
    modalities: ["image"],
    image_config: {
      aspect_ratio: "1:1",
      image_size: size,
    },
  });

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const message = response.choices[0]?.message;
  const usage = response.usage;

  console.log(`Done in ${elapsed}s`);
  console.log(`Usage:`, JSON.stringify(usage, null, 2));

  if (message && "images" in message && Array.isArray((message as any).images)) {
    const img = (message as any).images[0];
    let dataUrl: string | undefined;
    if (typeof img === "string") {
      dataUrl = img;
    } else if (img?.image_url?.url) {
      dataUrl = img.image_url.url;
    } else if (img?.b64_json) {
      dataUrl = `data:image/png;base64,${img.b64_json}`;
    }
    if (dataUrl) {
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
      const fs = await import("fs");
      fs.writeFileSync("scripts/test-output.png", Buffer.from(base64, "base64"));
      console.log(`Saved to scripts/test-output.png (${(Buffer.from(base64, "base64").length / 1024 / 1024).toFixed(1)} MB)`);
    } else {
      console.log("Unknown image format:", typeof img, JSON.stringify(img)?.substring(0, 200));
    }
  } else if (message?.content?.startsWith("data:image")) {
    const base64 = message.content.replace(/^data:image\/\w+;base64,/, "");
    const fs = await import("fs");
    fs.writeFileSync("scripts/test-output.png", Buffer.from(base64, "base64"));
    console.log("Saved to scripts/test-output.png");
  } else {
    console.log("Response:", JSON.stringify(message, null, 2));
  }

  console.log("\nCheck exact cost at: https://openrouter.ai/activity");
}

main().catch(console.error);
