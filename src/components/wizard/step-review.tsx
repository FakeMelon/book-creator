"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { useCoverPolling } from "@/hooks/use-cover-polling";
import { useDemoCoverGeneration } from "@/hooks/use-demo-cover-generation";
import { isDemoMode } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { THEMES, PERSONALITY_TRAITS, ILLUSTRATION_STYLES } from "@/constants";
import { cn } from "@/lib/utils";

const GENERATING_MESSAGES = [
  "Crafting the story...",
  "Imagining the characters...",
  "Painting the scenes...",
  "Adding a sprinkle of magic...",
  "Mixing the colors...",
  "Writing the adventure...",
  "Polishing the details...",
  "Almost there...",
];

const COVER_STAGES = [
  { key: "FRONT_COVER", label: "Front Cover" },
  { key: "BACK_COVER", label: "Back Cover" },
];

type WizardCoverPhase = "review" | "generating" | "ready" | "error";

const REVIEW_SUB_STEP_COUNT = 2;

function getReviewSubStepIndex(phase: WizardCoverPhase): number {
  if (phase === "review" || phase === "generating") return 0;
  return 1; // ready or error
}

function ReviewSubStepDots({ phase }: { phase: WizardCoverPhase }) {
  const currentIndex = getReviewSubStepIndex(phase);
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: REVIEW_SUB_STEP_COUNT }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            i === currentIndex
              ? "bg-primary w-6"
              : i < currentIndex
              ? "bg-primary"
              : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}

export function StepReview() {
  const store = useWizardStore();
  const demoCover = useDemoCoverGeneration(isDemoMode);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [coverData, setCoverData] = useState<{
    title: string | null;
    coverImageUrl: string | null;
    backCoverImageUrl: string | null;
  } | null>(null);
  const [rotatingMsg, setRotatingMsg] = useState(0);
  const [generationProgress, setGenerationProgress] = useState(0);

  const coverPhase = store.coverPhase;
  const bookId = store.bookId;

  // Rotate fun messages during generation
  useEffect(() => {
    if (coverPhase !== "generating") return;
    const timer = setInterval(() => {
      setRotatingMsg((prev) => (prev + 1) % GENERATING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [coverPhase]);

  // Animate progress bar during generation
  useEffect(() => {
    if (coverPhase !== "generating") {
      setGenerationProgress(0);
      return;
    }
    // Slowly increment progress to ~85%, then wait for real completion signal
    const timer = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 85) return prev;
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [coverPhase]);

  const handleCoverReady = useCallback(
    (data: { title: string | null; coverImageUrl: string | null; backCoverImageUrl: string | null }) => {
      setCoverData(data);
      setGenerationProgress(100);
      useWizardStore.getState().setCoverPhase("ready");
    },
    []
  );

  const handlePollingError = useCallback(
    (msg: string) => {
      const s = useWizardStore.getState();
      s.setCoverError(msg);
      s.setCoverPhase("error");
    },
    []
  );

  useCoverPolling({
    bookId,
    enabled: !isDemoMode && coverPhase === "generating",
    onCoverReady: handleCoverReady,
    onError: handlePollingError,
  });

  // When in "ready" phase without coverData in local state, refetch from server (non-demo only)
  useEffect(() => {
    if (isDemoMode || !bookId) return;
    if (coverPhase === "ready" && !coverData) {
      fetch(`/api/books/${bookId}/status`)
        .then((r) => {
          if (!r.ok) throw new Error(`Status check failed: ${r.status}`);
          return r.json();
        })
        .then((data) => {
          if (data.coverImageUrl) {
            setCoverData({
              title: data.title,
              coverImageUrl: data.coverImageUrl,
              backCoverImageUrl: data.backCoverImageUrl,
            });
          }
        })
        .catch((err) => {
          console.error("Failed to refetch cover status:", err);
        });
    }
  }, [coverPhase, coverData, bookId]);

  // Sync demo cover hook results into wizard store and local component state
  const demoCoverPhase = demoCover?.phase;
  const demoCoverProgress = demoCover?.progress;
  const demoCoverError = demoCover?.error;
  const demoCoverData = demoCover?.coverData;

  useEffect(() => {
    if (!demoCover) return;
    const s = useWizardStore.getState();
    if (demoCoverPhase === "done" && demoCoverData) {
      setCoverData({
        title: demoCoverData.title,
        coverImageUrl: demoCoverData.coverImageUrl,
        backCoverImageUrl: demoCoverData.backCoverImageUrl,
      });
      setGenerationProgress(100);
      s.setCoverPhase("ready");
    } else if (demoCoverError) {
      s.setCoverError(demoCoverError);
      s.setCoverPhase("error");
    } else if (demoCoverPhase !== "idle" && demoCoverPhase !== "done") {
      setGenerationProgress(demoCoverProgress ?? 0);
    }
  }, [demoCover, demoCoverPhase, demoCoverProgress, demoCoverError, demoCoverData]);

  const themeConfig = THEMES.find((t) => t.id === store.theme);
  const styleConfig = ILLUSTRATION_STYLES.find((s) => s.id === store.illustrationStyle);
  const selectedTraits = store.personalityTraits
    .map((id) => PERSONALITY_TRAITS.find((t) => t.id === id))
    .filter(Boolean);

  const allFoods = [...store.favoriteFoods, ...store.customFavoriteFoods];
  const allHobbies = [...store.hobbies, ...store.customHobbies];
  const allCharacters = [...store.favoriteCharacters, ...store.customFavoriteCharacters];
  const allAnimals = [...store.favoriteAnimal, ...store.customFavoriteAnimals];
  const photoCount = store.childPhotos.length || (store.photoPreview ? 1 : 0);

  async function handleGenerateCover() {
    setCreating(true);
    setError("");

    if (isDemoMode && demoCover) {
      // Demo mode: orchestrate client-side via demo APIs
      store.setCoverPhase("generating");
      demoCover.generate();
      setCreating(false);
      return;
    }

    try {
      const allFavoriteThings = [...store.favoriteThings, ...store.customFavoriteThings];

      // Step 1: Create the book in DRAFT status
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          childName: store.childName,
          childAge: store.childAge,
          childGender: store.childGender,
          favoriteThings: allFavoriteThings,
          personalityTraits: [...store.personalityTraits, ...store.customPersonalityTraits],
          theme: store.theme,
          occasion: store.occasion,
          hobbies: allHobbies.length > 0 ? allHobbies : undefined,
          favoriteCharacters: allCharacters.length > 0 ? allCharacters : undefined,
          favoriteAnimal: allAnimals.length > 0 ? allAnimals : undefined,
          favoriteFoods: allFoods.length > 0 ? allFoods : undefined,
          storyStyle: store.storyStyle,
          illustrationStyle: store.illustrationStyle,
          dedication: store.dedication || undefined,
          childPhotoKey: store.childPhotoKeys[0] || store.photoKey,
          childPhotoKeys: store.childPhotoKeys.length > 0 ? store.childPhotoKeys : undefined,
          additionalCharacters:
            store.additionalCharacters.length > 0
              ? store.additionalCharacters.map((c) => ({
                  name: c.name,
                  role: c.role,
                  photoKey: c.photoKey,
                }))
              : undefined,
          selectedTitle: store.selectedTitle,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create book");
      }

      const { bookId: newBookId } = await res.json();
      store.setBookId(newBookId);

      // Step 2: Trigger cover generation — await to detect network/server failures
      const coverRes = await fetch(`/api/books/${newBookId}/generate-cover`, {
        method: "POST",
      });
      if (!coverRes.ok) {
        const coverErr = await coverRes.json().catch(() => ({}));
        throw new Error(coverErr.error || "Failed to start cover generation");
      }

      // Step 3: Switch to generating phase (polling starts automatically)
      store.setCoverPhase("generating");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }

    setCreating(false);
  }

  function handleRetry() {
    store.setBookId(null);
    store.setCoverError(null);
    store.setCoverPhase("review");
    setError("");
  }

  function handleGoBackFromCovers() {
    store.setBookId(null);
    store.setCoverPhase("review");
    store.setCoverError(null);
    setCoverData(null);
    store.prevStep();
  }

  // ── Phase: Error ──
  if (coverPhase === "error") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6 max-w-lg mx-auto text-center"
      >
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <ReviewSubStepDots phase={coverPhase} />
        <h2 className="font-display text-2xl font-bold">Cover Generation Failed</h2>
        <p className="text-muted-foreground">
          {store.coverError || "Something went wrong while generating your covers. Please try again."}
        </p>
        <div className="space-y-3">
          <Button onClick={handleRetry} size="xl" className="w-full">
            Try Again
          </Button>
          <Button onClick={handleGoBackFromCovers} variant="ghost" className="w-full">
            Go Back & Edit
          </Button>
        </div>
      </motion.div>
    );
  }

  // ── Phase: Generating ──
  if (coverPhase === "generating") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8 max-w-lg mx-auto text-center"
      >
        <div>
          <h2 className="font-display text-3xl font-bold">Creating Your Covers</h2>
          <p className="text-muted-foreground mt-2">This usually takes 1-2 minutes</p>
        </div>

        <ReviewSubStepDots phase={coverPhase} />

        {/* Progress bar */}
        <div className="space-y-3">
          <Progress value={generationProgress} />
          <AnimatePresence mode="wait">
            <motion.p
              key={rotatingMsg}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-muted-foreground font-medium"
            >
              {GENERATING_MESSAGES[rotatingMsg]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Stage indicators */}
        <div className="space-y-2">
          {COVER_STAGES.map((stage, i) => {
            const stageProgress = (generationProgress / 100) * COVER_STAGES.length;
            const currentStageIndex = Math.min(Math.floor(stageProgress), COVER_STAGES.length - 1);
            const isComplete = generationProgress >= 100 || i < currentStageIndex;
            const isActive = !isComplete && i === currentStageIndex;
            return (
              <div key={stage.key} className="flex items-center gap-3 text-left">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isComplete
                      ? "bg-primary text-primary-foreground"
                      : isActive
                      ? "bg-primary/20 text-primary ring-2 ring-primary/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isComplete ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold">{i + 1}</span>
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isComplete ? "text-foreground" : isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {stage.label}
                </span>
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // ── Phase: Ready (covers generated) ──
  if (coverPhase === "ready") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-8 max-w-lg mx-auto"
      >
        <ReviewSubStepDots phase={coverPhase} />

        <div className="text-center">
          <h2 className="font-display text-3xl font-bold">Your Covers Are Ready!</h2>
          <p className="text-muted-foreground mt-2">
            Here&apos;s a sneak peek of <span className="font-semibold">{coverData?.title || store.selectedTitle}</span>
          </p>
        </div>

        {/* Cover images side by side */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-wide">
              Front Cover
            </p>
            <div className="aspect-square rounded-xl overflow-hidden shadow-lg border relative">
              {coverData?.coverImageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverData.coverImageUrl}
                    alt="Front cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 top-0 p-3 pt-4 text-center">
                    <h3
                      className="font-display font-bold text-white leading-tight"
                      style={{
                        fontSize: "clamp(0.7rem, 3.5cqi, 1.2rem)",
                        textShadow: "0 1px 4px rgba(0,0,0,0.6), 0 0 8px rgba(0,0,0,0.3)",
                      }}
                    >
                      {coverData.title || store.selectedTitle}
                    </h3>
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Loading...</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground text-center uppercase tracking-wide">
              Back Cover
            </p>
            <div className="aspect-square rounded-xl overflow-hidden shadow-lg border">
              {coverData?.backCoverImageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={coverData.backCoverImageUrl}
                  alt="Back cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">Loading...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          {isDemoMode ? (
            <>
              <Button
                size="xl"
                className="w-full"
                onClick={() => { window.location.href = "/register"; }}
              >
                Sign Up to Generate Full Book
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Create an account to generate the complete illustrated book
              </p>
            </>
          ) : (
            <>
              <Button
                size="xl"
                className="w-full"
                onClick={() => {
                  window.location.href = `/generate/${bookId}`;
                }}
              >
                Generate Full Book
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Generate the complete illustrated book with all pages
              </p>
            </>
          )}
          <Button onClick={handleGoBackFromCovers} variant="ghost" className="w-full">
            Go Back & Edit
          </Button>
        </div>
      </motion.div>
    );
  }

  // ── Phase: Review (default) ──
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 max-w-lg mx-auto"
    >
      <ReviewSubStepDots phase={coverPhase} />

      <div className="text-center">
        <h2 className="font-display text-3xl font-bold">Ready to Create!</h2>
        <p className="text-muted-foreground mt-2">Review your choices, then generate a free cover preview</p>
      </div>

      <div className="bg-muted/30 rounded-2xl p-6 space-y-6">
        {/* Selected Book Idea */}
        {store.selectedTitle && (
          <div className="text-center pb-2">
            <p className="text-sm font-semibold text-muted-foreground">Book Idea</p>
            <p className="font-display text-2xl font-bold text-primary">{store.selectedTitle}</p>
            {store.selectedBookIdea?.description && (
              <p className="text-muted-foreground text-sm mt-1">{store.selectedBookIdea.description}</p>
            )}
          </div>
        )}

        <hr />

        {/* Child Info */}
        <div className="flex items-start gap-4">
          {(store.childPhotos[0]?.preview || store.photoPreview) && (
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={store.childPhotos[0]?.preview || store.photoPreview!}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <h3 className="font-bold text-lg">{store.childName}</h3>
            <p className="text-sm text-muted-foreground">
              Age {store.childAge} &middot;{" "}
              {store.childGender === "boy" ? "He/Him" : store.childGender === "girl" ? "She/Her" : "They/Them"}
            </p>
            {photoCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {photoCount} photo{photoCount > 1 ? "s" : ""} uploaded
              </p>
            )}
          </div>
        </div>

        <hr />

        {/* Creative Direction */}
        <div className="space-y-3">
          {store.occasion && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Occasion</p>
              <p className="font-bold">{store.occasion}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Theme</p>
            <p className="font-bold">
              {themeConfig?.icon} {themeConfig?.name}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Personality</p>
            <div className="flex flex-wrap gap-2">
              {selectedTraits.map((trait) => (
                <Badge key={trait!.id} variant="secondary">
                  {trait!.emoji} {trait!.label}
                </Badge>
              ))}
              {store.customPersonalityTraits.map((trait) => (
                <Badge key={trait} variant="secondary">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
          {allFoods.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Favorite Foods</p>
              <div className="flex flex-wrap gap-1.5">
                {allFoods.map((food) => (
                  <Badge key={food} variant="outline">
                    {food}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {allHobbies.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Hobbies</p>
              <div className="flex flex-wrap gap-1.5">
                {allHobbies.map((hobby) => (
                  <Badge key={hobby} variant="outline">
                    {hobby}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {allCharacters.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Favorite Characters</p>
              <div className="flex flex-wrap gap-1.5">
                {allCharacters.map((char) => (
                  <Badge key={char} variant="outline">
                    {char}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {allAnimals.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Favorite Animals</p>
              <div className="flex flex-wrap gap-1.5">
                {allAnimals.map((animal) => (
                  <Badge key={animal} variant="outline">
                    {animal}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Characters */}
        {store.additionalCharacters.length > 0 && (
          <>
            <hr />
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Additional Characters</p>
              <div className="space-y-2">
                {store.additionalCharacters.map((char, i) => (
                  <div key={i} className="flex items-center gap-3">
                    {char.photoPreview && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={char.photoPreview}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{char.name || "Unnamed"}</p>
                      <p className="text-xs text-muted-foreground">{char.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <hr />

        {/* Style */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Writing</p>
              <p className="font-bold">{store.storyStyle === "PROSE" ? "Prose" : "Rhyme"}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-muted-foreground">Art Style</p>
              <p className="font-bold">{styleConfig?.name}</p>
            </div>
          </div>
          {store.dedication && (
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Dedication</p>
              <p className="italic text-sm">&ldquo;{store.dedication}&rdquo;</p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <Button onClick={handleGenerateCover} loading={creating} size="xl" className="w-full">
          Generate Cover Preview
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Free preview — see your book covers before committing
        </p>
        <Button onClick={store.prevStep} variant="ghost" className="w-full">
          Go Back & Edit
        </Button>
      </div>
    </motion.div>
  );
}
