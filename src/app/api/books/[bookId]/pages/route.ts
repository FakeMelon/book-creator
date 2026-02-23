import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updatePageTextSchema } from "@/validators";

export async function PATCH(
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
  });

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { pageNumber, text } = updatePageTextSchema.parse({ bookId, ...body });

    const page = await db.bookPage.update({
      where: { bookId_pageNumber: { bookId, pageNumber } },
      data: { text },
    });

    return NextResponse.json(page);
  } catch (error) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
}
