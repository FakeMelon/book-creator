"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PRICING } from "@/constants";
import { Link, useRouter } from "@/i18n/navigation";

type CoverType = "HARDCOVER" | "SOFTCOVER";

interface BookInfo {
  id: string;
  title: string;
  childName: string;
  coverImageUrl: string | null;
}

const COUNTRY_CODES = ["US", "CA", "GB", "AU", "DE", "FR", "IL"] as const;

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.bookId as string;
  const t = useTranslations("Checkout");
  const tH = useTranslations("Header");

  const [book, setBook] = useState<BookInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [coverType, setCoverType] = useState<CoverType>("HARDCOVER");
  const [shippingName, setShippingName] = useState("");
  const [shippingAddress1, setShippingAddress1] = useState("");
  const [shippingAddress2, setShippingAddress2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("US");

  const price = coverType === "HARDCOVER" ? PRICING.HARDCOVER_8X8 : PRICING.SOFTCOVER_8X8;

  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`/api/books/${bookId}`);
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setBook(data);
      } catch {
        setError("Failed to load book");
      }
      setLoading(false);
    }
    fetchBook();
  }, [bookId]);

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          coverType,
          shippingName,
          shippingAddress1,
          shippingAddress2: shippingAddress2 || undefined,
          shippingCity,
          shippingState: shippingState || undefined,
          shippingPostalCode,
          shippingCountry,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Checkout failed");
      }

      const { checkoutUrl } = await res.json();
      // Redirect to LemonSqueezy checkout
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const coverLabel = coverType === "HARDCOVER" ? t("hardcover") : t("softcover");

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold text-primary">
            {tH("brand")}
          </Link>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/preview/${bookId}`)}>
            {t("backToPreview")}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-center mb-8">{t("title")}</h1>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Form */}
            <form onSubmit={handleCheckout} className="md:col-span-3 space-y-6">
              {/* Format selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("chooseFormat")}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {[
                    { type: "HARDCOVER" as CoverType, label: t("hardcover"), price: "$34.99", desc: t("premiumQuality") },
                    { type: "SOFTCOVER" as CoverType, label: t("softcover"), price: "$24.99", desc: t("greatValue") },
                  ].map((option) => (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => setCoverType(option.type)}
                      className={cn(
                        "p-4 rounded-xl border-2 text-start transition-all",
                        coverType === option.type
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-muted hover:bg-muted/80"
                      )}
                    >
                      <p className="font-bold">{option.label}</p>
                      <p className="text-primary font-bold text-lg">{option.price}</p>
                      <p className="text-sm text-muted-foreground">{option.desc}</p>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Shipping address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("shippingAddress")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder={t("fullName")}
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    required
                  />
                  <Input
                    placeholder={t("address1")}
                    value={shippingAddress1}
                    onChange={(e) => setShippingAddress1(e.target.value)}
                    required
                  />
                  <Input
                    placeholder={t("address2")}
                    value={shippingAddress2}
                    onChange={(e) => setShippingAddress2(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder={t("city")}
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      required
                    />
                    <Input
                      placeholder={t("state")}
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder={t("postalCode")}
                      value={shippingPostalCode}
                      onChange={(e) => setShippingPostalCode(e.target.value)}
                      required
                    />
                    <select
                      className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm"
                      value={shippingCountry}
                      onChange={(e) => setShippingCountry(e.target.value)}
                    >
                      {COUNTRY_CODES.map((code) => (
                        <option key={code} value={code}>
                          {t(`country.${code}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                  {error}
                </div>
              )}

              <Button type="submit" size="xl" className="w-full" loading={submitting}>
                {t("proceedToPayment")}
              </Button>
            </form>

            {/* Order summary */}
            <div className="md:col-span-2">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  {book?.coverImageUrl && (
                    <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={book.coverImageUrl} alt={book.title || ""} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-display font-bold text-lg">{book?.title}</h3>
                    <p className="text-sm text-muted-foreground">For {book?.childName}</p>
                  </div>
                  <hr />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>8&quot; x 8&quot; {coverLabel}</span>
                      <span>${(price / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>{t("shipping")}</span>
                      <span>{t("calculatedAtCheckout")}</span>
                    </div>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t("total")}</span>
                    <span>${(price / 100).toFixed(2)}+</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {t("shipsIn")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
