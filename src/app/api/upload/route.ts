import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/config";

// ─── Demo mode: save to tmpdir ───

async function handleDemoUpload(req: Request) {
  const { writeFile } = await import("fs/promises");
  const { join } = await import("path");
  const { tmpdir } = await import("os");
  const { randomUUID } = await import("crypto");

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const formData = await req.formData();
  const file = formData.get("photo") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No photo provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Use JPEG, PNG, or WebP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10MB." },
      { status: 400 }
    );
  }

  const ext = file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg";
  const photoId = randomUUID();
  const filename = `${photoId}${ext}`;
  const filepath = join(tmpdir(), filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return NextResponse.json({ photoId, filename });
}

// ─── Normal mode: presigned R2 URL ───

async function handleNormalUpload(req: Request) {
  const { auth } = await import("@/lib/auth");
  const { getPresignedUploadUrl, generatePhotoKey } = await import("@/lib/r2");

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename, contentType } = await req.json();

  if (!filename || !contentType) {
    return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(contentType)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
  }

  const key = generatePhotoKey(session.user.id, filename);
  const uploadUrl = await getPresignedUploadUrl(key, contentType);

  return NextResponse.json({ uploadUrl, key });
}

// ─── Route handler ───

export async function POST(req: Request) {
  try {
    if (isDemoMode) {
      return await handleDemoUpload(req);
    }
    return await handleNormalUpload(req);
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
