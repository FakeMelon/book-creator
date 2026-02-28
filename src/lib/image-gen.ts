import OpenAI from "openai";
import { ILLUSTRATION_STYLES } from "@/constants";
import type { IllustrationStyle } from "@/types";
import { getStyleName } from "@/lib/constant-labels";

const IMAGE_MODEL = process.env.IMAGE_MODEL!;
const IMAGE_SIZE = process.env.IMAGE_SIZE || "1K"; // 1K, 2K, or 4K — use 1K for testing, 4K for print
const IS_MULTIMODAL_MODEL = IMAGE_MODEL.startsWith("google/");

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
    modalities: IS_MULTIMODAL_MODEL ? ["image", "text"] : ["image"],
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

  const styleName = styleConfig ? getStyleName(styleConfig.id) : "whimsical";
  const prompt = `Transform this child's photo into a ${styleName} children's book illustration style character reference sheet. Show the character in 4 different poses: standing front view, side profile walking, sitting, and a happy jumping pose. ${styleConfig?.fluxStylePrompt}. The character should be clearly recognizable as the child in the photo but rendered in the illustration style. Clean white background, character sheet layout.`;

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

  const prompt = `${sceneDescription}. Rendered in ${styleConfig?.fluxStylePrompt}. Full bleed children's book illustration, professional quality, high detail, vibrant colors suitable for print at 300 DPI. STRICTLY FORBIDDEN: no text, no letters, no words, no numbers, no writing, no signs anywhere in the image. The main character should match the reference image exactly in appearance and style.`;

  return generateImage(prompt, characterRefUrl);
}

export async function generateBackCoverIllustration(
  hiddenMotif: string,
  illustrationStyle: IllustrationStyle
): Promise<string> {
  const styleConfig = ILLUSTRATION_STYLES.find((s) => s.id === illustrationStyle);

  const prompt = `Decorative children's book back cover illustration: a beautiful, whimsical seamless pattern featuring "${hiddenMotif}" motifs scattered across the design. Pure decorative pattern only — gentle colors, organic shapes, and playful motifs filling the entire image. STRICTLY FORBIDDEN: no text, no letters, no words, no numbers, no barcode, no ISBN, no price tag, no UPC code, no QR code, no characters, no people, no faces. ${styleConfig?.fluxStylePrompt}. Professional quality, suitable for print at 300 DPI.`;

  // No character reference — back covers are decorative patterns with no characters
  return generateImage(prompt);
}

export async function generateCoverIllustration(
  characterRefUrl: string,
  title: string,
  sceneDescription: string,
  illustrationStyle: IllustrationStyle,
  _format: "SQUARE_8X8" | "LANDSCAPE_8X10" = "SQUARE_8X8"
): Promise<string> {
  const styleConfig = ILLUSTRATION_STYLES.find((s) => s.id === illustrationStyle);

  const prompt = `Book cover illustration: ${sceneDescription}. Leave a clear, uncluttered area at the top ~25% of the image for title text overlay. STRICTLY FORBIDDEN: no text, no letters, no words, no numbers, no writing, no signs, no labels anywhere in the image — the title will be added digitally later. ${styleConfig?.fluxStylePrompt}. Eye-catching children's book cover, professional quality, vibrant and inviting. The main character should match the reference image exactly.`;

  return generateImage(prompt, characterRefUrl);
}
