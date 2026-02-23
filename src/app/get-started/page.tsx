"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Header } from "@/components/shared/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GetStartedPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const { guestName, onboardingComplete, setGuestName, setGuestEmail, setOnboardingComplete } =
    useWizardStore();

  // If already completed onboarding, go straight to wizard
  useEffect(() => {
    if (onboardingComplete) {
      router.replace("/create");
    }
  }, [onboardingComplete, router]);

  // Pre-fill from store if returning
  useEffect(() => {
    if (guestName) setNameInput(guestName);
  }, [guestName]);

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

  if (onboardingComplete) return null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header
        onBack={handleBack}
        rightContent={
          <span className="text-sm text-muted-foreground">Step {step} of 3</span>
        }
      />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 flex items-center justify-center overflow-auto">
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
                    Let&apos;s get to know you
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    First, what should we call you?
                  </p>
                </div>

                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStep1()}
                  placeholder="Your first name"
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
                  Continue
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
                    Hey there, {guestName || nameInput}! 👋
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Where should we send your book updates?
                  </p>
                </div>

                <Input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStep2()}
                  placeholder="your@email.com"
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
                    Continue
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    By continuing, you agree to our{" "}
                    <Link href="/terms" target="_blank" className="underline hover:text-foreground">
                      Terms of Use
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" target="_blank" className="underline hover:text-foreground">
                      Privacy Policy
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
              className="text-center space-y-10"
            >
              <div className="space-y-3">
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                  Here&apos;s what you&apos;ll create
                </h1>
                <p className="text-lg text-muted-foreground">
                  A personalized book starring your child
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
                      className="absolute inset-0 rounded-r-lg rounded-l-sm bg-gradient-to-br from-primary to-purple-600 shadow-2xl flex flex-col items-center justify-center text-white p-6"
                      animate={{ rotateY: [0, -15, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      style={{ transformOrigin: "left center", backfaceVisibility: "hidden" }}
                    >
                      <div className="text-5xl mb-4">&#9734;</div>
                      <p className="font-display text-xl font-bold">The Amazing</p>
                      <p className="font-display text-2xl font-bold">Adventure</p>
                      <div className="mt-4 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                        &#128566;
                      </div>
                      <p className="mt-2 text-sm text-white/80">A story about your child</p>
                    </motion.div>

                    {/* Book spine shadow */}
                    <div className="absolute left-0 top-2 bottom-2 w-3 bg-primary/40 rounded-l-sm" />
                  </motion.div>
                </div>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
                {[
                  { icon: "\u270F\uFE0F", label: "Personalized Story", desc: "Tailored to your child" },
                  { icon: "\uD83C\uDFA8", label: "Custom Illustrations", desc: "Your child as the hero" },
                  { icon: "\uD83D\uDCD6", label: "32 Pages", desc: "Print-quality hardcover" },
                ].map((feature) => (
                  <div key={feature.label} className="text-center space-y-1">
                    <div className="text-3xl">{feature.icon}</div>
                    <p className="text-sm font-semibold">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                ))}
              </div>

              <Button size="lg" onClick={handleStart} className="px-12 text-lg">
                Start Creating
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
