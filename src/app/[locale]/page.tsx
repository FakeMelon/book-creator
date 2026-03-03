"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

const EXAMPLE_BOOKS = [
  { key: "luna", src: "/images/examples/luna-space.png" },
  { key: "marcus", src: "/images/examples/marcus-forest.png" },
  { key: "river", src: "/images/examples/river-underwater.png" },
] as const;

const STEP_KEYS = [
  { key: "step1", icon: "👶" },
  { key: "step2", icon: "📸" },
  { key: "step3", icon: "🎨" },
  { key: "step4", icon: "✨" },
] as const;

const FEATURE_KEYS = [
  { key: "looksLikeChild", icon: "🪄" },
  { key: "storyQuality", icon: "📝" },
  { key: "readyFast", icon: "⚡" },
  { key: "artStyles", icon: "🎨" },
  { key: "printQuality", icon: "📦" },
  { key: "perfectGift", icon: "💝" },
] as const;

const TESTIMONIAL_KEYS = ["sarah", "david", "linda"] as const;

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5"] as const;

export default function LandingPage() {
  const t = useTranslations("Landing");

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold text-primary">
            Littletales
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              {t("nav.signIn")}
            </Link>
            <Link href="/get-started">
              <Button size="sm">{t("nav.createBook")}</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-rose-50 via-white to-rose-50">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              {t("hero.badge")}
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
              {t("hero.titleStart")}{" "}
              <span className="text-primary">{t("hero.titleHighlight")}</span>{" "}
              {t("hero.titleEnd")}
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("hero.description")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/get-started">
                <Button size="xl" className="text-lg px-10">
                  {t("hero.cta")}
                </Button>
              </Link>
              <Link href="/examples">
                <Button variant="outline" size="xl" className="text-lg px-10">
                  {t("hero.seeExamples")}
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              {t("hero.disclaimer")}
            </p>
          </motion.div>

          {/* Example book covers */}
          <div className="mt-16 max-w-4xl mx-auto flex items-end justify-center gap-4 sm:gap-8">
            {EXAMPLE_BOOKS.map((book, i) => {
              const isCenter = i === 1;
              return (
                <motion.div
                  key={book.key}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.15 }}
                  className={`flex flex-col items-center ${isCenter ? "z-10" : ""}`}
                >
                  <div
                    className={`aspect-square rounded-xl overflow-hidden shadow-xl border relative transition-transform hover:scale-105 ${
                      isCenter
                        ? "w-40 sm:w-56 md:w-64 -mb-2"
                        : "w-32 sm:w-44 md:w-52"
                    }`}
                    style={{ containerType: "inline-size" }}
                  >
                    <Image
                      src={book.src}
                      alt={t(`hero.examples.${book.key}Caption`)}
                      width={512}
                      height={512}
                      className="w-full h-full object-cover"
                      priority={isCenter}
                    />
                    <div className="absolute inset-x-0 top-0 px-8 pt-4 text-center">
                      <h3
                        className="font-display font-bold text-white leading-tight line-clamp-2"
                        style={{
                          fontSize: "clamp(0.55rem, 3cqi, 1rem)",
                          textShadow: "0 1px 4px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.3)",
                        }}
                      >
                        {t(`hero.examples.${book.key}Title`)}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-3 text-xs sm:text-sm text-muted-foreground font-medium">
                    {t(`hero.examples.${book.key}Caption`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4" id="how-it-works">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold">{t("howItWorks.title")}</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {STEP_KEYS.map((step, i) => (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 pt-8">
                    <div className="text-5xl mb-4">{step.icon}</div>
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-4">
                      {i + 1}
                    </div>
                    <h3 className="font-bold text-lg mb-2">
                      {t(`howItWorks.${step.key}.title`)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(`howItWorks.${step.key}.description`)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold">{t("features.title")}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {FEATURE_KEYS.map((feature, i) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-2">
                  {t(`features.${feature.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`features.${feature.key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold">{t("testimonials.title")}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIAL_KEYS.map((key, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 pt-8">
                    <div className="text-2xl text-primary mb-4">&ldquo;</div>
                    <p className="text-foreground mb-4">
                      {t(`testimonials.items.${key}.quote`)}
                    </p>
                    <div>
                      <p className="font-bold">
                        {t(`testimonials.items.${key}.name`)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t(`testimonials.items.${key}.role`)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-muted/30" id="pricing">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold mb-4">{t("pricing.title")}</h2>
          <p className="text-lg text-muted-foreground mb-12">
            {t("pricing.subtitle")}
          </p>

          <PricingCards t={t} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4" id="faq">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-center mb-12">
            {t("faq.title")}
          </h2>

          <div className="space-y-4">
            {FAQ_KEYS.map((key) => (
              <details
                key={key}
                className="group bg-white rounded-xl border p-6 cursor-pointer"
              >
                <summary className="flex items-center justify-between font-semibold list-none">
                  {t(`faq.${key}.question`)}
                  <svg
                    className="w-5 h-5 text-muted-foreground transition-transform group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-4 text-muted-foreground">{t(`faq.${key}.answer`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-rose-500 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-xl text-white/80 mb-8">
            {t("cta.subtitle")}
          </p>
          <Link href="/get-started">
            <Button size="xl" variant="secondary" className="text-lg px-10">
              {t("cta.button")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-display text-xl font-bold mb-4">Littletales</h3>
            <p className="text-sm text-white/60">
              {t("footer.tagline")}
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t("footer.product")}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/get-started" className="hover:text-white">{t("footer.createBook")}</Link></li>
              <li><Link href="/examples" className="hover:text-white">{t("footer.examples")}</Link></li>
              <li><Link href="/pricing" className="hover:text-white">{t("footer.pricing")}</Link></li>
              <li><Link href="/faq" className="hover:text-white">{t("footer.faq")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t("footer.company")}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/about" className="hover:text-white">{t("footer.about")}</Link></li>
              <li><Link href="/contact" className="hover:text-white">{t("footer.contact")}</Link></li>
              <li><Link href="/privacy" className="hover:text-white">{t("footer.privacyPolicy")}</Link></li>
              <li><Link href="/terms" className="hover:text-white">{t("footer.termsOfService")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">{t("footer.support")}</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="mailto:hello@littletales.com" className="hover:text-white">hello@littletales.com</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/40">
          &copy; {new Date().getFullYear()} Littletales. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

interface PricingCardsProps {
  t: ReturnType<typeof useTranslations<"Landing">>;
}

function PricingCards({ t }: PricingCardsProps) {
  const plans = [
    {
      type: t("pricing.softcover"),
      price: t("pricing.softcoverPrice"),
      badge: null,
      features: [
        t("pricing.fullColorPages"),
        t("pricing.premiumPaper"),
        t("pricing.worldwideShipping"),
      ],
    },
    {
      type: t("pricing.hardcover"),
      price: t("pricing.hardcoverPrice"),
      badge: t("pricing.mostPopular"),
      features: [
        t("pricing.fullColorPages"),
        t("pricing.durableHardcover"),
        t("pricing.premiumPaper"),
        t("pricing.worldwideShipping"),
      ],
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
      {plans.map((plan) => (
        <Card key={plan.type} className={plan.badge ? "border-primary shadow-lg relative" : ""}>
          {plan.badge && (
            <div className="absolute -top-3 start-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
              {plan.badge}
            </div>
          )}
          <CardContent className="p-8 pt-10">
            <h3 className="font-bold text-xl mb-2">{plan.type}</h3>
            <p className="font-display text-4xl font-bold text-primary mb-6">{plan.price}</p>
            <ul className="space-y-3 text-sm text-start">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-success shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/get-started" className="block mt-6">
              <Button className="w-full" variant={plan.badge ? "default" : "outline"}>
                {t("pricing.getStarted")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
