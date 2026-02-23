import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";
import { isDemoMode } from "@/lib/config";
import {
  generateCharacterReference,
  generatePageIllustration,
  generateCoverIllustration,
} from "@/lib/image-gen";
import type { IllustrationStyle } from "@/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!isDemoMode) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { type } = body;

    if (type === "character-ref") {
      return await handleCharacterRef(body);
    } else if (type === "illustration") {
      return await handleIllustration(body);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("Image generation error:", err);
    const message = err instanceof Error ? err.message : "Image generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleCharacterRef(body: {
  photoId: string;
  photoFilename: string;
  childName: string;
  illustrationStyle: IllustrationStyle;
}) {
  const { photoId, photoFilename, childName, illustrationStyle } = body;

  if (!photoId || !childName || !illustrationStyle) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Read photo from temp dir and convert to data URL
  const filename = photoFilename || `${photoId}.jpg`;
  const filepath = join(tmpdir(), filename);
  const photoBuffer = await readFile(filepath);
  const ext = filename.split(".").pop() || "jpg";
  const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  const photoDataUrl = `data:${mimeType};base64,${photoBuffer.toString("base64")}`;

  // Generate character reference
  const characterRefDataUrl = await generateCharacterReference(
    photoDataUrl,
    childName,
    illustrationStyle
  );

  // Save character ref to temp dir for later use by illustration requests
  const characterRefId = randomUUID();
  const refBuffer = Buffer.from(
    characterRefDataUrl.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );
  const refFilepath = join(tmpdir(), `${characterRefId}.png`);
  await writeFile(refFilepath, refBuffer);

  return NextResponse.json({ characterRefId });
}

async function handleIllustration(body: {
  characterRefId?: string;
  sceneDescription: string;
  illustrationStyle: IllustrationStyle;
  pageNumber: number;
  pageType: string;
  bookTitle?: string;
}) {
  const { characterRefId, sceneDescription, illustrationStyle, pageNumber, pageType, bookTitle } =
    body;

  if (!sceneDescription || !illustrationStyle) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Load character ref data URL if available
  let characterRefDataUrl: string | undefined;
  if (characterRefId) {
    const refPath = join(tmpdir(), `${characterRefId}.png`);
    const refBuffer = await readFile(refPath);
    characterRefDataUrl = `data:image/png;base64,${refBuffer.toString("base64")}`;
  }

  let imageDataUrl: string;

  if (pageType === "COVER" && bookTitle) {
    imageDataUrl = await generateCoverIllustration(
      characterRefDataUrl || "",
      bookTitle,
      sceneDescription,
      illustrationStyle
    );
  } else {
    imageDataUrl = await generatePageIllustration(
      characterRefDataUrl || "",
      sceneDescription,
      illustrationStyle,
      pageNumber
    );
  }

  return NextResponse.json({ pageNumber, imageDataUrl });
}
