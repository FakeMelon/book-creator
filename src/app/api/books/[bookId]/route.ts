import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookId } = await params;

  const book = await db.book.findUnique({
    where: { id: bookId, userId: session.user.id },
    include: {
      pages: {
        orderBy: { pageNumber: "asc" },
        select: {
          pageNumber: true,
          type: true,
          text: true,
          textPosition: true,
          illustrationUrl: true,
          isApproved: true,
        },
      },
    },
  });

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: book.id,
    title: book.title,
    childName: book.childName,
    coverImageUrl: book.coverImageUrl,
    status: book.status,
    illustrationStyle: book.illustrationStyle,
    theme: book.theme,
    pages: book.pages,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookId } = await params;
  const body = await req.json();

  const book = await db.book.findUnique({
    where: { id: bookId, userId: session.user.id },
  });

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const updated = await db.book.update({
    where: { id: bookId },
    data: body,
  });

  return NextResponse.json(updated);
}
