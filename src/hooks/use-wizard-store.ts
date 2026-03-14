"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StoryStyle, IllustrationStyle, AdditionalCharacter, ChildPhoto, BookIdea } from "@/types";

interface WizardState {
  step: number;
  /** 1 = forward, -1 = backward — used for step transition animation direction */
  direction: 1 | -1;
  maxStepReached: number;
  childName: string;
  childAge: string;
  childGender: string;
  favoriteThings: string[];
  customFavoriteThings: string[];
  personalityTraits: string[];
  customPersonalityTraits: string[];
  theme: string;
  occasion: string;
  subject: string;
  storyMessage: string;
  hobbies: string[];
  customHobbies: string[];
  favoriteCharacters: string[];
  customFavoriteCharacters: string[];
  favoriteAnimal: string[];
  customFavoriteAnimals: string[];
  favoriteFoods: string[];
  customFavoriteFoods: string[];
  // Legacy single photo
  photoFile: File | null;
  photoPreview: string | null;
  photoKey: string | null;
  // Multi-photo
  childPhotos: ChildPhoto[];
  childPhotoKeys: string[];
  additionalCharacters: AdditionalCharacter[];
  // Style
  storyStyle: StoryStyle;
  illustrationStyle: IllustrationStyle;
  dedication: string;
  // Book language
  bookLanguage: string;
  // Book idea selection
  selectedTitle: string;
  bookIdeas: BookIdea[];
  selectedBookIdea: BookIdea | null;
  ideasInputFingerprint: string;
  // Cover generation
  bookId: string | null;
  coverPhase: "review" | "generating" | "ready" | "error";
  coverError: string | null;
  // Guest onboarding
  guestName: string;
  guestEmail: string;
  referralSource: string;
  onboardingComplete: boolean;
}

interface WizardActions {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setChildName: (name: string) => void;
  setChildAge: (age: string) => void;
  setChildGender: (gender: string) => void;
  toggleFavoriteThing: (thing: string) => void;
  addCustomFavoriteThing: (thing: string) => void;
  removeCustomFavoriteThing: (thing: string) => void;
  togglePersonalityTrait: (trait: string) => void;
  addCustomPersonalityTrait: (trait: string) => void;
  removeCustomPersonalityTrait: (trait: string) => void;
  setTheme: (theme: string) => void;
  setOccasion: (occasion: string) => void;
  setSubject: (subject: string) => void;
  setStoryMessage: (storyMessage: string) => void;
  toggleHobby: (hobby: string) => void;
  addCustomHobby: (hobby: string) => void;
  removeCustomHobby: (hobby: string) => void;
  toggleFavoriteCharacter: (character: string) => void;
  addCustomFavoriteCharacter: (character: string) => void;
  removeCustomFavoriteCharacter: (character: string) => void;
  toggleFavoriteAnimal: (animal: string) => void;
  addCustomFavoriteAnimal: (animal: string) => void;
  removeCustomFavoriteAnimal: (animal: string) => void;
  toggleFavoriteFood: (food: string) => void;
  addCustomFavoriteFood: (food: string) => void;
  removeCustomFavoriteFood: (food: string) => void;
  // Legacy single photo
  setPhoto: (file: File | null, preview: string | null) => void;
  setPhotoKey: (key: string) => void;
  // Multi-photo
  addChildPhoto: (photo: ChildPhoto) => void;
  removeChildPhoto: (index: number) => void;
  setChildPhotoKeys: (keys: string[]) => void;
  addAdditionalCharacter: (character: AdditionalCharacter) => void;
  updateAdditionalCharacter: (index: number, character: AdditionalCharacter) => void;
  removeAdditionalCharacter: (index: number) => void;
  // Style
  setStoryStyle: (style: StoryStyle) => void;
  setIllustrationStyle: (style: IllustrationStyle) => void;
  setDedication: (text: string) => void;
  // Book language
  setBookLanguage: (lang: string) => void;
  // Book ideas
  setSelectedTitle: (title: string) => void;
  setBookIdeas: (ideas: BookIdea[], fingerprint: string) => void;
  setSelectedBookIdea: (idea: BookIdea) => void;
  clearBookIdeas: () => void;
  // Cover generation
  setBookId: (id: string | null) => void;
  setCoverPhase: (phase: "review" | "generating" | "ready" | "error") => void;
  setCoverError: (error: string | null) => void;
  // Guest onboarding
  setGuestName: (name: string) => void;
  setGuestEmail: (email: string) => void;
  setReferralSource: (source: string) => void;
  setOnboardingComplete: (complete: boolean) => void;
  resetWizard: () => void;
  reset: () => void;
}

const initialState: WizardState = {
  step: 1,
  direction: 1,
  maxStepReached: 1,
  childName: "",
  childAge: "",
  childGender: "",
  favoriteThings: [],
  customFavoriteThings: [],
  personalityTraits: [],
  customPersonalityTraits: [],
  theme: "",
  occasion: "",
  subject: "",
  storyMessage: "",
  hobbies: [],
  customHobbies: [],
  favoriteCharacters: [],
  customFavoriteCharacters: [],
  favoriteAnimal: [],
  customFavoriteAnimals: [],
  favoriteFoods: [],
  customFavoriteFoods: [],
  photoFile: null,
  photoPreview: null,
  photoKey: null,
  childPhotos: [],
  childPhotoKeys: [],
  additionalCharacters: [],
  storyStyle: "PROSE",
  illustrationStyle: "WATERCOLOR",
  dedication: "",
  bookLanguage: "",
  selectedTitle: "",
  bookIdeas: [],
  selectedBookIdea: null,
  ideasInputFingerprint: "",
  bookId: null,
  coverPhase: "review",
  coverError: null,
  guestName: "",
  guestEmail: "",
  referralSource: "",
  onboardingComplete: false,
};

// Migration mapping for illustration styles (v2 → v3)
const STYLE_MIGRATION: Record<string, string> = {
  WATERCOLOR_WHIMSY: "WATERCOLOR",
  BRIGHT_AND_BOLD: "COMIC_POP",
  STORYBOOK_CLASSIC: "PICTURE_BOOK",
  COZY_AND_WARM: "GOUACHE_PAINTERLY",
};

// Migration mapping for numeric ages → age ranges (v2 → v3)
function migrateAge(age: unknown): string {
  if (typeof age === "string" && ["0-2", "3-5", "6-9", "10+"].includes(age)) return age;
  if (typeof age === "number") {
    if (age <= 2) return "0-2";
    if (age <= 5) return "3-5";
    if (age <= 9) return "6-9";
    return "10+";
  }
  return "";
}

export const useWizardStore = create<WizardState & WizardActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => {
        const current = get();
        const clamped = Math.max(1, Math.min(step, 6));
        set({
          step: clamped,
          direction: clamped >= current.step ? 1 : -1,
          maxStepReached: Math.max(current.maxStepReached, clamped),
        });
      },
      nextStep: () => {
        const next = Math.min(get().step + 1, 6);
        set({ step: next, direction: 1, maxStepReached: Math.max(get().maxStepReached, next) });
      },
      prevStep: () => set({ step: Math.max(get().step - 1, 1), direction: -1 }),

      setChildName: (childName) =>
        set({
          childName: childName
            .split(/(\s+)/)
            .map((part) => (part.trim() ? part.charAt(0).toUpperCase() + part.slice(1) : part))
            .join(""),
        }),
      setChildAge: (childAge) => set({ childAge }),
      setChildGender: (childGender) => set({ childGender }),

      // Favorite things (preset + custom share the same max of 5)
      toggleFavoriteThing: (thing) => {
        const { favoriteThings, customFavoriteThings } = get();
        const total = favoriteThings.length + customFavoriteThings.length;
        if (favoriteThings.includes(thing)) {
          set({ favoriteThings: favoriteThings.filter((t) => t !== thing) });
        } else if (total < 5) {
          set({ favoriteThings: [...favoriteThings, thing] });
        }
      },
      addCustomFavoriteThing: (thing) => {
        const { favoriteThings, customFavoriteThings } = get();
        const total = favoriteThings.length + customFavoriteThings.length;
        if (total < 5 && !customFavoriteThings.includes(thing)) {
          set({ customFavoriteThings: [...customFavoriteThings, thing] });
        }
      },
      removeCustomFavoriteThing: (thing) => {
        set({ customFavoriteThings: get().customFavoriteThings.filter((t) => t !== thing) });
      },

      // Personality traits (preset + custom share max of 3)
      togglePersonalityTrait: (trait) => {
        const { personalityTraits, customPersonalityTraits } = get();
        const total = personalityTraits.length + customPersonalityTraits.length;
        if (personalityTraits.includes(trait)) {
          set({ personalityTraits: personalityTraits.filter((t) => t !== trait) });
        } else if (total < 3) {
          set({ personalityTraits: [...personalityTraits, trait] });
        }
      },
      addCustomPersonalityTrait: (trait) => {
        const { personalityTraits, customPersonalityTraits } = get();
        const total = personalityTraits.length + customPersonalityTraits.length;
        if (total < 3 && !customPersonalityTraits.includes(trait)) {
          set({ customPersonalityTraits: [...customPersonalityTraits, trait] });
        }
      },
      removeCustomPersonalityTrait: (trait) => {
        set({ customPersonalityTraits: get().customPersonalityTraits.filter((t) => t !== trait) });
      },

      setTheme: (theme) => set({ theme, subject: "" }),
      setOccasion: (occasion) => set({ occasion }),
      setSubject: (subject) => set({ subject }),
      setStoryMessage: (storyMessage) => set({ storyMessage }),

      // Hobbies (preset + custom share max of 5)
      toggleHobby: (hobby) => {
        const { hobbies, customHobbies } = get();
        const total = hobbies.length + customHobbies.length;
        if (hobbies.includes(hobby)) {
          set({ hobbies: hobbies.filter((h) => h !== hobby) });
        } else if (total < 5) {
          set({ hobbies: [...hobbies, hobby] });
        }
      },
      addCustomHobby: (hobby) => {
        const { hobbies, customHobbies } = get();
        const total = hobbies.length + customHobbies.length;
        if (total < 5 && !customHobbies.includes(hobby)) {
          set({ customHobbies: [...customHobbies, hobby] });
        }
      },
      removeCustomHobby: (hobby) => {
        set({ customHobbies: get().customHobbies.filter((h) => h !== hobby) });
      },

      // Favorite characters (preset + custom share max of 3)
      toggleFavoriteCharacter: (character) => {
        const { favoriteCharacters, customFavoriteCharacters } = get();
        const total = favoriteCharacters.length + customFavoriteCharacters.length;
        if (favoriteCharacters.includes(character)) {
          set({ favoriteCharacters: favoriteCharacters.filter((c) => c !== character) });
        } else if (total < 3) {
          set({ favoriteCharacters: [...favoriteCharacters, character] });
        }
      },
      addCustomFavoriteCharacter: (character) => {
        const { favoriteCharacters, customFavoriteCharacters } = get();
        const total = favoriteCharacters.length + customFavoriteCharacters.length;
        if (total < 3 && !customFavoriteCharacters.includes(character)) {
          set({ customFavoriteCharacters: [...customFavoriteCharacters, character] });
        }
      },
      removeCustomFavoriteCharacter: (character) => {
        set({ customFavoriteCharacters: get().customFavoriteCharacters.filter((c) => c !== character) });
      },

      // Favorite animals (preset + custom share max of 3)
      toggleFavoriteAnimal: (animal) => {
        const { favoriteAnimal, customFavoriteAnimals } = get();
        const total = favoriteAnimal.length + customFavoriteAnimals.length;
        if (favoriteAnimal.includes(animal)) {
          set({ favoriteAnimal: favoriteAnimal.filter((a) => a !== animal) });
        } else if (total < 3) {
          set({ favoriteAnimal: [...favoriteAnimal, animal] });
        }
      },
      addCustomFavoriteAnimal: (animal) => {
        const { favoriteAnimal, customFavoriteAnimals } = get();
        const total = favoriteAnimal.length + customFavoriteAnimals.length;
        if (total < 3 && !customFavoriteAnimals.includes(animal)) {
          set({ customFavoriteAnimals: [...customFavoriteAnimals, animal] });
        }
      },
      removeCustomFavoriteAnimal: (animal) => {
        set({ customFavoriteAnimals: get().customFavoriteAnimals.filter((a) => a !== animal) });
      },

      // Favorite foods (preset + custom share max of 3)
      toggleFavoriteFood: (food) => {
        const { favoriteFoods, customFavoriteFoods } = get();
        const total = favoriteFoods.length + customFavoriteFoods.length;
        if (favoriteFoods.includes(food)) {
          set({ favoriteFoods: favoriteFoods.filter((f) => f !== food) });
        } else if (total < 3) {
          set({ favoriteFoods: [...favoriteFoods, food] });
        }
      },
      addCustomFavoriteFood: (food) => {
        const { favoriteFoods, customFavoriteFoods } = get();
        const total = favoriteFoods.length + customFavoriteFoods.length;
        if (total < 3 && !customFavoriteFoods.includes(food)) {
          set({ customFavoriteFoods: [...customFavoriteFoods, food] });
        }
      },
      removeCustomFavoriteFood: (food) => {
        set({ customFavoriteFoods: get().customFavoriteFoods.filter((f) => f !== food) });
      },

      // Legacy single photo
      setPhoto: (photoFile, photoPreview) => set({ photoFile, photoPreview }),
      setPhotoKey: (photoKey) => set({ photoKey }),

      // Multi-photo
      addChildPhoto: (photo) => {
        const current = get().childPhotos;
        if (current.length < 5) {
          set({ childPhotos: [...current, photo] });
        }
      },
      removeChildPhoto: (index) => {
        set({ childPhotos: get().childPhotos.filter((_, i) => i !== index) });
      },
      setChildPhotoKeys: (childPhotoKeys) => set({ childPhotoKeys }),

      // Additional characters
      addAdditionalCharacter: (character) => {
        const current = get().additionalCharacters;
        if (current.length < 4) {
          set({ additionalCharacters: [...current, character] });
        }
      },
      updateAdditionalCharacter: (index, character) => {
        const current = [...get().additionalCharacters];
        current[index] = character;
        set({ additionalCharacters: current });
      },
      removeAdditionalCharacter: (index) => {
        set({ additionalCharacters: get().additionalCharacters.filter((_, i) => i !== index) });
      },

      // Style
      setStoryStyle: (storyStyle) => set({ storyStyle }),
      setIllustrationStyle: (illustrationStyle) => set({ illustrationStyle }),
      setDedication: (dedication) => set({ dedication }),

      // Book language
      setBookLanguage: (bookLanguage) => set({ bookLanguage }),

      // Book ideas — prefer setSelectedBookIdea; selectedTitle is kept for createBook API compat
      setSelectedTitle: (selectedTitle) => set({ selectedTitle }),
      setBookIdeas: (bookIdeas, ideasInputFingerprint) =>
        set({ bookIdeas, ideasInputFingerprint, selectedBookIdea: null, selectedTitle: "" }),
      setSelectedBookIdea: (idea) =>
        set({ selectedBookIdea: idea, selectedTitle: idea.title }),
      clearBookIdeas: () =>
        set({ bookIdeas: [], selectedBookIdea: null, ideasInputFingerprint: "", selectedTitle: "" }),

      // Cover generation
      setBookId: (bookId) => set({ bookId }),
      setCoverPhase: (coverPhase) => set({ coverPhase }),
      setCoverError: (coverError) => set({ coverError }),

      // Guest onboarding
      setGuestName: (guestName) => set({ guestName }),
      setGuestEmail: (guestEmail) => set({ guestEmail }),
      setReferralSource: (referralSource) => set({ referralSource }),
      setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),

      // Reset wizard fields only (keep guest onboarding info)
      resetWizard: () => {
        const { guestName, guestEmail, referralSource, onboardingComplete } = get();
        set({ ...initialState, guestName, guestEmail, referralSource, onboardingComplete });
      },

      reset: () => set(initialState),
    }),
    {
      name: "wizard-storage",
      version: 3,
      migrate: (persisted: any, version: number) => {
        if (!persisted || typeof persisted !== "object") {
          return initialState;
        }
        if (version === 0) {
          persisted = { ...persisted, step: Math.min(persisted.step ?? 1, 5), bookId: null, coverPhase: "review", coverError: null, maxStepReached: persisted.step ?? 1 };
        }
        if (version <= 1) {
          persisted = { ...persisted, maxStepReached: persisted.step ?? 1 };
        }
        if (version <= 2) {
          // v2 → v3: migrate illustration styles, age format, add new fields
          const oldStyle = persisted.illustrationStyle;
          persisted = {
            ...persisted,
            illustrationStyle: STYLE_MIGRATION[oldStyle] || oldStyle || "WATERCOLOR",
            childAge: migrateAge(persisted.childAge),
            subject: persisted.subject ?? "",
            storyMessage: persisted.storyMessage ?? "",
            bookLanguage: persisted.bookLanguage ?? "",
          };
        }
        return persisted as WizardState;
      },
      partialize: (state): WizardState => ({
        // Cap at step 5 so users re-enter the cover preview flow fresh
        step: Math.min(state.step, 5),
        direction: 1,
        maxStepReached: Math.min(state.maxStepReached, 5),
        childName: state.childName,
        childAge: state.childAge,
        childGender: state.childGender,
        favoriteThings: state.favoriteThings,
        customFavoriteThings: state.customFavoriteThings,
        personalityTraits: state.personalityTraits,
        customPersonalityTraits: state.customPersonalityTraits,
        theme: state.theme,
        occasion: state.occasion,
        subject: state.subject,
        storyMessage: state.storyMessage,
        hobbies: state.hobbies,
        customHobbies: state.customHobbies,
        favoriteCharacters: state.favoriteCharacters,
        customFavoriteCharacters: state.customFavoriteCharacters,
        favoriteAnimal: state.favoriteAnimal,
        customFavoriteAnimals: state.customFavoriteAnimals,
        favoriteFoods: state.favoriteFoods,
        customFavoriteFoods: state.customFavoriteFoods,
        photoFile: null,
        photoPreview: state.photoPreview,
        photoKey: state.photoKey,
        childPhotoKeys: state.childPhotoKeys,
        additionalCharacters: state.additionalCharacters.map((c) => ({
          name: c.name,
          role: c.role,
          photoPreview: c.photoPreview,
          photoKey: c.photoKey,
          photoFile: null,
        })),
        storyStyle: state.storyStyle,
        illustrationStyle: state.illustrationStyle,
        dedication: state.dedication,
        bookLanguage: state.bookLanguage,
        selectedTitle: state.selectedTitle,
        bookIdeas: state.bookIdeas,
        selectedBookIdea: state.selectedBookIdea,
        ideasInputFingerprint: state.ideasInputFingerprint,
        // Persist childPhotos previews only (exclude File objects)
        childPhotos: state.childPhotos.map((p) => ({
          file: null,
          preview: p.preview,
        })),
        bookId: null,
        coverPhase: "review",
        coverError: null,
        guestName: state.guestName,
        guestEmail: state.guestEmail,
        referralSource: state.referralSource,
        onboardingComplete: state.onboardingComplete,
      }),
    }
  )
);

/** Wait for Zustand persist hydration before reading store values */
export function useWizardHydrated() {
  return useSyncExternalStore(
    (cb) => useWizardStore.persist.onFinishHydration(cb),
    () => useWizardStore.persist.hasHydrated(),
    () => false
  );
}
