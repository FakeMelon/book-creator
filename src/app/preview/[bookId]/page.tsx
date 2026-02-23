"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookViewer } from "@/components/book-preview/book-viewer";
import { Button } from "@/components/ui/button";
import type { BookPreviewData } from "@/types";
import Link from "next/link";

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;

  const [book, setBook] = useState<BookPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`/api/books/${bookId}`);
        if (!res.ok) throw new Error("Failed to load book");
        const data = await res.json();
        setBook(data);
      } catch {
        setError("Failed to load book preview");
      }
      setLoading(false);
    }
    fetchBook();
  }, [bookId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error || "Book not found"}</p>
          <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold text-primary">
            Storymagic
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
              My Books
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Book title */}
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold">{book.title}</h1>
            <p className="text-muted-foreground mt-2">
              A personalized book for {book.childName}
            </p>
          </div>

          {/* Book viewer */}
          <div className="max-w-2xl mx-auto">
            <BookViewer
              pages={book.pages}
              title={book.title}
              childName={book.childName}
              coverImageUrl={book.coverImageUrl}
            />
          </div>

          {/* Action bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Button
              size="xl"
              onClick={() => router.push(`/checkout/${bookId}`)}
              className="w-full sm:w-auto"
            >
              Order My Book — From $24.99
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                // TODO: Open edit modal
              }}
              className="w-full sm:w-auto"
            >
              Edit Text
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Free preview — only pay when you order a printed copy
          </p>
        </motion.div>
      </main>
    </div>
  );
}
