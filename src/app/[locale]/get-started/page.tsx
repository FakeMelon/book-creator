"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useWizardStore, useWizardHydrated } from "@/hooks/use-wizard-store";
import { REFERRAL_SOURCE_OPTIONS } from "@/constants";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GetStartedPage() {
  const router = useRouter();
  const t = useTranslations("GetStarted");
  const tRef = useTranslations("ReferralSources");
  const [step, setStep] = useState(1);
  const hasHydrated = useWizardHydrated();
  const { guestName, onboardingComplete, setGuestName, setGuestEmail, setReferralSource, setOnboardingComplete } =
    useWizardStore();

  const [nameInput, setNameInput] = useState(() => guestName || "");
  const [emailInput, setEmailInput] = useState("");

  // If already completed onboarding, go straight to wizard
  useEffect(() => {
    if (hasHydrated && onboardingComplete) {
      router.replace("/create");
    }
  }, [hasHydrated, onboardingComplete, router]);

  function handleStep1() {
    if (!nameInput.trim()) return;
    setGuestName(nameInput.trim());
    setStep(2);
  }

  function handleStep2() {
    if (!emailInput.trim()) return;
    setGuestEmail(emailInput.trim());
    setStep(3);
  }

  function handleReferralSelect(source: string) {
    setReferralSource(source);
    // Fire-and-forget save to API (best-effort for authenticated users)
    fetch("/api/referral-source", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralSource: source }),
    }).catch((err) => {
      console.warn("Failed to save referral source:", err);
    });
    setStep(4);
  }

  function handleSkipReferral() {
    setStep(4);
  }

  function handleStart() {
    setOnboardingComplete(true);
    router.push("/create");
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push("/");
    }
  }

  if (!hasHydrated || onboardingComplete) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-rose-50 via-white to-rose-50">
      <Header onBack={handleBack} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 flex items-center justify-center overflow-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl mx-auto"
            >
              <div className="bg-white rounded-2xl border shadow-sm p-12 space-y-10 text-center">
                <div className="space-y-3">
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                    {t("step1.title")}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {t("step1.subtitle")}
                  </p>
                </div>

                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStep1()}
                  placeholder={t("step1.placeholder")}
                  autoFocus
                  className="text-lg h-14"
                  maxLength={30}
                />

                <Button
                  size="lg"
                  onClick={handleStep1}
                  disabled={!nameInput.trim()}
                  className="px-12"
                >
                  {t("step1.continue")}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl mx-auto"
            >
              <div className="bg-white rounded-2xl border shadow-sm p-12 space-y-10 text-center">
                <div className="space-y-3">
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                    {t("step2.titleWithName", { name: guestName || nameInput })}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {t("step2.subtitle")}
                  </p>
                </div>

                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStep2()}
                  placeholder={t("step2.placeholder")}
                  autoFocus
                  className="text-lg h-14"
                />

                <div className="space-y-4">
                  <Button
                    size="lg"
                    onClick={handleStep2}
                    disabled={!emailInput.trim()}
                    className="px-12"
                  >
                    {t("step2.continue")}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {t("step2.agreement")}{" "}
                    <Link href="/terms" target="_blank" className="underline hover:text-foreground">
                      {t("step2.terms")}
                    </Link>{" "}
                    {t("step2.and")}{" "}
                    <Link href="/privacy" target="_blank" className="underline hover:text-foreground">
                      {t("step2.privacy")}
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl mx-auto"
            >
              <div className="bg-white rounded-2xl border shadow-sm p-12 space-y-8 text-center">
                <div className="space-y-3">
                  <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                    {t("step3.title")}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {t("step3.subtitle")}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {REFERRAL_SOURCE_OPTIONS.map((source) => (
                    <button
                      key={source}
                      onClick={() => handleReferralSelect(source)}
                      className="rounded-xl border-2 border-border bg-white px-3 py-3 text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/5 active:scale-95"
                    >
                      {tRef(source)}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleSkipReferral}
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  {t("step3.skip")}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
              className="text-center space-y-10"
            >
              <div className="space-y-3">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                  {t("step4.title")}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t("step4.subtitle")}
                </p>
              </div>

              {/* Book mockup */}
              <div className="relative max-w-xs mx-auto">
                <div className="perspective-[1000px]">
                  <motion.div
                    className="relative w-64 h-80 mx-auto"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Book cover */}
                    <motion.div
                      className="absolute inset-0 rounded-e-lg rounded-s-sm bg-gradient-to-br from-primary to-rose-500 shadow-2xl flex flex-col items-center justify-center text-white p-6"
                      animate={{ rotateY: [0, -15, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      style={{ transformOrigin: "left center", backfaceVisibility: "hidden" }}
                    >
                      <div className="text-5xl mb-4">&#9734;</div>
                      <p className="font-display text-xl font-bold">{t("step4.theAmazing")}</p>
                      <p className="font-display text-2xl font-bold">{t("step4.adventure")}</p>
                      <div className="mt-4 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                        &#128566;
                      </div>
                      <p className="mt-2 text-sm text-white/80">{t("step4.storyAbout")}</p>
                    </motion.div>

                    {/* Book spine shadow */}
                    <div className="absolute start-0 top-2 bottom-2 w-3 bg-primary/40 rounded-s-sm" />
                  </motion.div>
                </div>
              </div>

              <Button size="lg" onClick={handleStart} className="px-12 text-lg">
                {t("step4.start")}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
