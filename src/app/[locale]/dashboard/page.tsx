"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookSummary {
  id: string;
  title: string | null;
  childName: string;
  status: string;
  coverImageUrl: string | null;
  theme: string;
  createdAt: string;
}

type StatusVariant = "default" | "secondary" | "success" | "warning";

const STATUS_KEYS: Record<string, { translationKey: string; variant: StatusVariant }> = {
  DRAFT: { translationKey: "statusDraft", variant: "secondary" },
  GENERATING: { translationKey: "statusGenerating", variant: "warning" },
  PREVIEW_READY: { translationKey: "statusPreviewReady", variant: "success" },
  APPROVED: { translationKey: "statusApproved", variant: "success" },
  ORDERED: { translationKey: "statusOrdered", variant: "default" },
};

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const t = useTranslations("Dashboard");
  const tH = useTranslations("Header");
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderSuccess = searchParams.get("order");

  const [books, setBooks] = useState<BookSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await fetch("/api/books");
        if (res.ok) {
          const data = await res.json();
          setBooks(data.books);
        }
      } catch {
        console.error("Failed to load books");
      }
      setLoading(false);
    }
    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold text-primary">
            {tH("brand")}
          </Link>
          <Link href="/create">
            <Button size="sm">{t("createNew")}</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-success/10 border border-success/20 text-center"
          >
            <p className="font-bold text-success">
              {t("orderSuccess", { orderNumber: orderSuccess })}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("orderShipping")}
            </p>
          </motion.div>
        )}

        <h1 className="font-display text-3xl font-bold mb-8">{t("title")}</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">📚</div>
            <h2 className="font-display text-2xl font-bold mb-2">{t("emptyTitle")}</h2>
            <p className="text-muted-foreground mb-8">
              {t("emptyDescription")}
            </p>
            <Link href="/create">
              <Button size="xl">{t("emptyButton")}</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book, i) => {
              const statusConfig = STATUS_KEYS[book.status] ?? STATUS_KEYS.DRAFT;
              const bookUrl =
                book.status === "GENERATING"
                  ? `/generate/${book.id}`
                  : `/preview/${book.id}`;

              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card
                    className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => router.push(bookUrl)}
                  >
                    <div className="aspect-square bg-gradient-to-br from-primary/10 to-rose-50 relative overflow-hidden">
                      {book.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={book.coverImageUrl}
                          alt={book.title || ""}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-6xl">
                          📖
                        </div>
                      )}
                      <div className="absolute top-3 end-3">
                        <Badge variant={statusConfig.variant}>
                          {t(statusConfig.translationKey)}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg truncate">
                        {book.title || `Book for ${book.childName}`}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("bookFor")} {book.childName} &middot;{" "}
                        {new Date(book.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
