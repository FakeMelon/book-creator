"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWizardStore } from "@/hooks/use-wizard-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { THEMES, PERSONALITY_TRAITS, ILLUSTRATION_STYLES, OCCASION_OPTIONS } from "@/constants";

interface StepReviewProps {
  onSubmit?: () => void;
}

export function StepReview({ onSubmit }: StepReviewProps = {}) {
  const store = useWizardStore();
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const themeConfig = THEMES.find((t) => t.id === store.theme);
  const styleConfig = ILLUSTRATION_STYLES.find((s) => s.id === store.illustrationStyle);
  const selectedTraits = store.personalityTraits
    .map((id) => PERSONALITY_TRAITS.find((t) => t.id === id))
    .filter(Boolean);

  const allFavoriteThings = [...store.favoriteThings, ...store.customFavoriteThings];
  const allHobbies = [...store.hobbies, ...store.customHobbies];
  const allCharacters = [...store.favoriteCharacters, ...store.customFavoriteCharacters];
  const allAnimals = [...store.favoriteAnimal, ...store.customFavoriteAnimals];
  const allTraitLabels = [
    ...selectedTraits.map((t) => t!.label),
    ...store.customPersonalityTraits,
  ];
  const photoCount = store.childPhotos.length || (store.photoPreview ? 1 : 0);

  async function handleCreate() {
    if (onSubmit) {
      onSubmit();
      return;
    }

    setCreating(true);
    setError("");

    try {
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
          storyStyle: store.storyStyle,
          illustrationStyle: store.illustrationStyle,
          dedication: store.dedication || undefined,
          childPhotoKey: store.childPhotoKeys[0] || store.photoKey,
          childPhotoKeys: store.childPhotoKeys.length > 0 ? store.childPhotoKeys : undefined,
          additionalCharacters: store.additionalCharacters.length > 0
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

      const { bookId } = await res.json();
      store.reset();
      router.push(`/generate/${bookId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }

    setCreating(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 max-w-lg mx-auto"
    >
      <div className="text-center">
        <h2 className="font-display text-3xl font-bold">Ready to Create!</h2>
        <p className="text-muted-foreground mt-2">Review your choices before we start</p>
      </div>

      <div className="bg-muted/30 rounded-2xl p-6 space-y-6">
        {/* Selected Title */}
        {store.selectedTitle && (
          <div className="text-center pb-2">
            <p className="text-sm font-semibold text-muted-foreground">Book Title</p>
            <p className="font-display text-2xl font-bold text-primary">{store.selectedTitle}</p>
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
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Favorite Things</p>
            <div className="flex flex-wrap gap-1.5">
              {allFavoriteThings.map((thing) => (
                <Badge key={thing} variant="outline">
                  {thing}
                </Badge>
              ))}
            </div>
          </div>

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
        <Button onClick={handleCreate} loading={creating} size="xl" className="w-full">
          Create My Book
        </Button>
        <Button onClick={store.prevStep} variant="ghost" className="w-full">
          Go Back & Edit
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Book generation takes 3-5 minutes. You&apos;ll see a live preview as pages are created.
      </p>
    </motion.div>
  );
}
