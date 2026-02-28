import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ExampleBook = {
  key: string;
  theme: string;
  style: string;
};

const EXAMPLE_BOOKS: ExampleBook[] = [
  { key: "luna", theme: "Enchanted Forest", style: "Watercolor Whimsy" },
  { key: "max", theme: "Space", style: "Bright & Bold" },
  { key: "mia", theme: "Underwater", style: "Cozy & Warm" },
  { key: "ethan", theme: "Adventure", style: "Storybook Classic" },
  { key: "sophie", theme: "Fairy Tale", style: "Watercolor Whimsy" },
  { key: "daniel", theme: "Dinosaurs", style: "Bright & Bold" },
];

export async function generateMetadata() {
  const t = await getTranslations("Marketing.examples");
  return { title: t("title") };
}

export default async function ExamplesPage() {
  const t = await getTranslations("Marketing.examples");
  const tCommon = await getTranslations("Common");

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold text-primary">
            {tCommon("littletales")}
          </Link>
          <Link href="/get-started">
            <Button size="sm">{tCommon("createBook")}</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-4">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {EXAMPLE_BOOKS.map((book) => (
            <Card key={book.key} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-gradient-to-br from-primary/10 to-rose-50 flex items-center justify-center">
                <div className="text-7xl">📖</div>
              </div>
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-lg mb-1">
                  {t(`books.${book.key}.title`)}
                </h3>
                <p className="text-sm text-primary font-medium mb-2">
                  {t(`books.${book.key}.child`)}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {t(`books.${book.key}.description`)}
                </p>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-muted">{book.theme}</span>
                  <span className="px-2 py-1 rounded-full bg-muted">{book.style}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <h2 className="font-display text-2xl font-bold mb-4">{t("readyTitle")}</h2>
          <Link href="/get-started">
            <Button size="xl">{t("createButton")}</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
