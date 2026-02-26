"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StoryStyle, IllustrationStyle, AdditionalCharacter, ChildPhoto, BookIdea } from "@/types";

interface WizardState {
  step: number;
  childName: string;
  childAge: number | null;
  childGender: string;
  favoriteThings: string[];
  customFavoriteThings: string[];
  personalityTraits: string[];
  customPersonalityTraits: string[];
  theme: string;
  occasion: string;
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
  // Book idea selection
  selectedTitle: string;
  bookIdeas: BookIdea[];
  selectedBookIdea: BookIdea | null;
  ideasInputFingerprint: string;
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
  setChildAge: (age: number | null) => void;
  setChildGender: (gender: string) => void;
  toggleFavoriteThing: (thing: string) => void;
  addCustomFavoriteThing: (thing: string) => void;
  removeCustomFavoriteThing: (thing: string) => void;
  togglePersonalityTrait: (trait: string) => void;
  addCustomPersonalityTrait: (trait: string) => void;
  removeCustomPersonalityTrait: (trait: string) => void;
  setTheme: (theme: string) => void;
  setOccasion: (occasion: string) => void;
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
  // Book ideas
  setSelectedTitle: (title: string) => void;
  setBookIdeas: (ideas: BookIdea[], fingerprint: string) => void;
  setSelectedBookIdea: (idea: BookIdea) => void;
  clearBookIdeas: () => void;
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
  childName: "",
  childAge: null,
  childGender: "",
  favoriteThings: [],
  customFavoriteThings: [],
  personalityTraits: [],
  customPersonalityTraits: [],
  theme: "",
  occasion: "",
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
  illustrationStyle: "WATERCOLOR_WHIMSY",
  dedication: "",
  selectedTitle: "",
  bookIdeas: [],
  selectedBookIdea: null,
  ideasInputFingerprint: "",
  guestName: "",
  guestEmail: "",
  referralSource: "",
  onboardingComplete: false,
};

export const useWizardStore = create<WizardState & WizardActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setStep: (step) => set({ step }),
      nextStep: () => set({ step: Math.min(get().step + 1, 6) }),
      prevStep: () => set({ step: Math.max(get().step - 1, 1) }),

      setChildName: (childName) =>
        set({ childName: childName.charAt(0).toUpperCase() + childName.slice(1) }),
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

      setTheme: (theme) => set({ theme }),
      setOccasion: (occasion) => set({ occasion }),

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

      // Book ideas
      setSelectedTitle: (selectedTitle) => set({ selectedTitle }),
      setBookIdeas: (bookIdeas, ideasInputFingerprint) =>
        set({ bookIdeas, ideasInputFingerprint, selectedBookIdea: null, selectedTitle: "" }),
      setSelectedBookIdea: (idea) =>
        set({ selectedBookIdea: idea, selectedTitle: idea.title }),
      clearBookIdeas: () =>
        set({ bookIdeas: [], selectedBookIdea: null, ideasInputFingerprint: "", selectedTitle: "" }),

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
      partialize: (state) => ({
        step: state.step,
        childName: state.childName,
        childAge: state.childAge,
        childGender: state.childGender,
        favoriteThings: state.favoriteThings,
        customFavoriteThings: state.customFavoriteThings,
        personalityTraits: state.personalityTraits,
        customPersonalityTraits: state.customPersonalityTraits,
        theme: state.theme,
        occasion: state.occasion,
        hobbies: state.hobbies,
        customHobbies: state.customHobbies,
        favoriteCharacters: state.favoriteCharacters,
        customFavoriteCharacters: state.customFavoriteCharacters,
        favoriteAnimal: state.favoriteAnimal,
        customFavoriteAnimals: state.customFavoriteAnimals,
        favoriteFoods: state.favoriteFoods,
        customFavoriteFoods: state.customFavoriteFoods,
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
        selectedTitle: state.selectedTitle,
        bookIdeas: state.bookIdeas,
        selectedBookIdea: state.selectedBookIdea,
        ideasInputFingerprint: state.ideasInputFingerprint,
        // Persist childPhotos previews only (exclude File objects)
        childPhotos: state.childPhotos.map((p) => ({
          file: null,
          preview: p.preview,
        })),
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
