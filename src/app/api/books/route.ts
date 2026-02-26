import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createBookSchema } from "@/validators";
import { getPublicUrl } from "@/lib/r2";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createBookSchema.parse(body);

    const book = await db.book.create({
      data: {
        userId: session.user.id,
        childName: data.childName,
        childAge: data.childAge,
        childGender: data.childGender,
        favoriteThings: data.favoriteThings,
        personalityTraits: data.personalityTraits,
        theme: data.theme,
        occasion: data.occasion,
        hobbies: data.hobbies || [],
        favoriteCharacters: data.favoriteCharacters || [],
        favoriteAnimal: data.favoriteAnimal || [],
        storyStyle: data.storyStyle,
        illustrationStyle: data.illustrationStyle,
        dedication: data.dedication,
        // Primary photo for generation pipeline backward compat
        childPhotoKey: data.childPhotoKey,
        childPhotoUrl: getPublicUrl(data.childPhotoKey),
        // Multi-photo keys
        childPhotoKeys: data.childPhotoKeys || [data.childPhotoKey],
        // Additional characters as JSON
        additionalCharacters: data.additionalCharacters
          ? (data.additionalCharacters.map((c) => ({
              name: c.name,
              role: c.role,
              photoKey: c.photoKey,
              photoUrl: c.photoKey ? getPublicUrl(c.photoKey) : null,
            })) as any)
          : undefined,
        // Use user-selected title
        title: data.selectedTitle,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ bookId: book.id }, { status: 201 });
  } catch (error) {
    console.error("Create book error:", error);
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const books = await db.book.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      childName: true,
      status: true,
      coverImageUrl: true,
      illustrationStyle: true,
      theme: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ books });
}
