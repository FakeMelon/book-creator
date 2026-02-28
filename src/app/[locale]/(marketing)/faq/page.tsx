import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const FAQ_CATEGORY_KEYS = ["creating", "quality", "ordering"] as const;

const QUESTION_COUNTS: Record<string, number> = {
  creating: 4,
  quality: 3,
  ordering: 4,
};

export async function generateMetadata() {
  const t = await getTranslations("Marketing.faq");
  return { title: t("title") };
}

export default async function FAQPage() {
  const t = await getTranslations("Marketing.faq");
  const tCommon = await getTranslations("Common");

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold text-primary">
            {tCommon("littletales")}
          </Link>
          <Link href="/create">
            <Button size="sm">{tCommon("createBook")}</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-display text-4xl font-bold text-center mb-12">
          {t("title")}
        </h1>

        <div className="space-y-12">
          {FAQ_CATEGORY_KEYS.map((categoryKey) => (
            <div key={categoryKey}>
              <h2 className="font-display text-2xl font-bold mb-6">
                {t(`categories.${categoryKey}.title`)}
              </h2>
              <div className="space-y-4">
                {Array.from({ length: QUESTION_COUNTS[categoryKey] }, (_, i) => {
                  const qKey = `q${i + 1}`;
                  return (
                    <details
                      key={qKey}
                      className="group bg-white rounded-xl border p-6 cursor-pointer"
                    >
                      <summary className="flex items-center justify-between font-semibold list-none">
                        {t(`categories.${categoryKey}.${qKey}.question`)}
                        <svg
                          className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180 shrink-0 ms-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <p className="mt-4 text-muted-foreground">
                        {t(`categories.${categoryKey}.${qKey}.answer`)}
                      </p>
                    </details>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-white rounded-xl border p-8">
          <h2 className="font-display text-2xl font-bold mb-2">
            {t("stillHaveQuestions")}
          </h2>
          <p className="text-muted-foreground mb-6">{t("loveToHelp")}</p>
          <a href="mailto:hello@littletales.com">
            <Button>{t("contactUs")}</Button>
          </a>
        </div>
      </main>
    </div>
  );
}
