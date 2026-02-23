import OpenAI from "openai";
import { ILLUSTRATION_STYLES } from "@/constants";
import type { IllustrationStyle } from "@/types";

const IMAGE_MODEL = process.env.IMAGE_MODEL!;
const IMAGE_SIZE = process.env.IMAGE_SIZE || "1K"; // 1K, 2K, or 4K — use 1K for testing, 4K for print

function getClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY!,
  });
}

/** Convert a data URL or base64 string to a Buffer */
export function dataUrlToBuffer(dataUrl: string): Buffer {
  const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  return Buffer.from(base64, "base64");
}

export async function generateImage(
  prompt: string,
  referenceImageUrl?: string
): Promise<string> {
  const client = getClient();

  const content: OpenAI.ChatCompletionContentPart[] = [];

  if (referenceImageUrl) {
    content.push({
      type: "image_url",
      image_url: { url: referenceImageUrl },
    });
  }

  content.push({ type: "text", text: prompt });

  const response = await client.chat.completions.create({
    model: IMAGE_MODEL,
    messages: [{ role: "user", content }],
    // @ts-expect-error -- OpenRouter extends the OpenAI API with modalities and image_config
    modalities: ["image"],
    image_config: {
      aspect_ratio: "1:1",
      image_size: IMAGE_SIZE,
    },
  });

  const message = response.choices[0]?.message;

  // OpenRouter returns images in message.images as {image_url: {url: "data:image/..."}} objects
  if (message && "images" in message && Array.isArray((message as any).images)) {
    const img = (message as any).images[0];
    if (typeof img === "string") return img;
    if (img?.image_url?.url) return img.image_url.url as string;
    if (img?.b64_json) return `data:image/png;base64,${img.b64_json}`;
  }

  // Some models return base64 data URL directly in content
  const content_resp = message?.content;
  if (content_resp && content_resp.startsWith("data:image")) {
    return content_resp;
  }

  throw new Error("No image returned from model");
}

export async function generateCharacterReference(
  photoUrl: string,
  childName: string,
  illustrationStyle: IllustrationStyle
): Promise<string> {
  const styleConfig = ILLUSTRATION_STYLES.find((s) => s.id === illustrationStyle);

  const prompt = `Transform this child's photo into a ${styleConfig?.name} children's book illustration style character reference sheet. Show the character in 4 different poses: standing front view, side profile walking, sitting, and a happy jumping pose. ${styleConfig?.fluxStylePrompt}. The character should be clearly recognizable as the child in the photo but rendered in the illustration style. Clean white background, character sheet layout.`;

  return generateImage(prompt, photoUrl);
}

export async function generatePageIllustration(
  characterRefUrl: string,
  sceneDescription: string,
  illustrationStyle: IllustrationStyle,
  _pageNumber: number,
  _format: "SQUARE_8X8" | "LANDSCAPE_8X10" = "SQUARE_8X8"
): Promise<string> {
  const styleConfig = ILLUSTRATION_STYLES.find((s) => s.id === illustrationStyle);

  const prompt = `${sceneDescription}. Rendered in ${styleConfig?.fluxStylePrompt}. Full bleed children's book illustration, professional quality, high detail, vibrant colors suitable for print at 300 DPI. The main character should match the reference image exactly in appearance and style.`;

  return generateImage(prompt, characterRefUrl);
}

export async function generateCoverIllustration(
  characterRefUrl: string,
  title: string,
  sceneDescription: string,
  illustrationStyle: IllustrationStyle,
  _format: "SQUARE_8X8" | "LANDSCAPE_8X10" = "SQUARE_8X8"
): Promise<string> {
  const styleConfig = ILLUSTRATION_STYLES.find((s) => s.id === illustrationStyle);

  const prompt = `Book cover illustration: ${sceneDescription}. The title "${title}" area should be at the top with clear space for text overlay. ${styleConfig?.fluxStylePrompt}. Eye-catching children's book cover, professional quality, vibrant and inviting. The main character should match the reference image exactly.`;

  return generateImage(prompt, characterRefUrl);
}
