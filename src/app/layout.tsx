import type { Metadata } from "next";
import { Quicksand, Fredoka, Baloo_2 } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const baloo2 = Baloo_2({
  subsets: ["latin"],
  variable: "--font-story",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Storymagic — Custom Children's Books with AI",
    template: "%s | Storymagic",
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
    locale: "en_US",
    siteName: "Storymagic",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${quicksand.variable} ${fredoka.variable} ${baloo2.variable}`}>
      <body className="font-sans min-h-screen">
        {children}
      </body>
    </html>
  );
}
