import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Plan = {
  nameKey: string;
  price: string;
  popular?: boolean;
  featureKeys: string[];
};

const PLANS: Plan[] = [
  {
    nameKey: "softcover8x8",
    price: "$24.99",
    featureKeys: ["fullColorPages", "highQualityPaper", "standardShipping"],
  },
  {
    nameKey: "hardcover8x8",
    price: "$34.99",
    popular: true,
    featureKeys: ["fullColorPages", "durableHardcover", "premiumPaper", "standardShipping"],
  },
  {
    nameKey: "hardcover8x10",
    price: "$39.99",
    featureKeys: ["fullColorPages", "largerFormat", "premiumQuality", "standardShipping"],
  },
];

type AddOn = {
  nameKey: string;
  price: string;
  descKey: string;
};

const ADD_ONS: AddOn[] = [
  { nameKey: "rushProcessing", price: "+$9.99", descKey: "rushProcessingDesc" },
  { nameKey: "giftWrapping", price: "+$4.99", descKey: "giftWrappingDesc" },
  { nameKey: "audioNarration", price: "+$4.99", descKey: "audioNarrationDesc" },
];

export async function generateMetadata() {
  const t = await getTranslations("Marketing.pricing");
  return { title: t("title") };
}

export default async function PricingPage() {
  const t = await getTranslations("Marketing.pricing");
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

      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-lg text-muted-foreground mb-12">{t("subtitle")}</p>

        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <Card key={plan.nameKey} className={plan.popular ? "border-primary shadow-lg relative" : ""}>
              {plan.popular && (
                <div className="absolute -top-3 start-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  {t("mostPopular")}
                </div>
              )}
              <CardContent className="p-8 pt-10">
                <h3 className="font-bold text-lg mb-2">{t(plan.nameKey)}</h3>
                <p className="font-display text-4xl font-bold text-primary mb-6">{plan.price}</p>
                <ul className="space-y-3 text-sm text-start mb-6">
                  {plan.featureKeys.map((featureKey) => (
                    <li key={featureKey} className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {t(featureKey)}
                    </li>
                  ))}
                </ul>
                <Link href="/create" className="block">
                  <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                    {t("getStarted")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-xl p-8 border">
          <h2 className="font-display text-2xl font-bold mb-4">{t("addOns")}</h2>
          <div className="grid md:grid-cols-3 gap-6 text-start">
            {ADD_ONS.map((addOn) => (
              <div key={addOn.nameKey} className="p-4">
                <p className="font-bold">{t(addOn.nameKey)}</p>
                <p className="text-primary font-bold">{addOn.price}</p>
                <p className="text-sm text-muted-foreground">{t(addOn.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
