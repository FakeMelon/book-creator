import type { Metadata } from "next";
import { Quicksand, Fredoka, Baloo_2, Rubik, Heebo } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Providers } from "@/components/providers";
import { routing } from "@/i18n/routing";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin", "hebrew"],
  variable: "--font-display",
  display: "swap",
});

const baloo2 = Baloo_2({
  subsets: ["latin"],
  variable: "--font-story",
  display: "swap",
});

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  variable: "--font-sans-he",
  display: "swap",
});

const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  variable: "--font-story-he",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Littletales — Custom Children's Books with AI",
    template: "%s | Littletales",
  },
  description:
    "Create personalized children's books where your child is the star. Upload a photo, choose a theme, and get a beautifully illustrated hardcover book delivered to your door.",
  keywords: [
    "personalized children's books",
    "custom kids books",
    "AI children's books",
    "personalized story books",
    "children's book with photo",
  ],
  openGraph: {
    type: "website",
    siteName: "Littletales",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === "he" ? "rtl" : "ltr";

  const fontVars = [
    quicksand.variable,
    fredoka.variable,
    baloo2.variable,
    rubik.variable,
    heebo.variable,
  ].join(" ");

  return (
    <html lang={locale} dir={dir} className={fontVars}>
      <body className="font-sans min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
