import type {
  Book,
  BookPage,
  Order,
  GenerationLog,
  BookStatus,
  BookFormat,
  StoryStyle,
  IllustrationStyle,
  PageType,
  OrderStatus,
  CoverType,
  GenerationStage,
  GenerationStatus,
} from "@prisma/client";

// Re-export Prisma types
export type {
  Book,
  BookPage,
  Order,
  GenerationLog,
  BookStatus,
  BookFormat,
  StoryStyle,
  IllustrationStyle,
  PageType,
  OrderStatus,
  CoverType,
  GenerationStage,
  GenerationStatus,
};

// ─── Book Idea Types ───

export interface BookIdea {
  title: string;
  description: string;
}

// ─── Wizard Types ───

export interface AdditionalCharacter {
  name: string;
  role: string;
  photoFile: File | null;
  photoPreview: string | null;
  photoKey: string | null;
}

export interface ChildPhoto {
  file: File | null;
  preview: string | null;
}

export interface WizardState {
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
  // Photo (legacy single)
  photoFile: File | null;
  photoPreview: string | null;
  // Multi-photo
  childPhotos: ChildPhoto[];
  childPhotoKeys: string[];
  additionalCharacters: AdditionalCharacter[];
  storyStyle: StoryStyle;
  illustrationStyle: IllustrationStyle;
  dedication: string;
  photoKey: string | null;
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

export interface WizardActions {
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateField: <K extends keyof WizardState>(key: K, value: WizardState[K]) => void;
  reset: () => void;
}

// ─── Story Generation Types ───

export interface StoryPage {
  pageNumber: number;
  type: PageType;
  text: string;
  illustrationDescription: string;
  textPosition: "top" | "bottom" | "left" | "right" | "overlay";
}

export interface GeneratedStory {
  title: string;
  pages: StoryPage[];
  hiddenMotif: string;
  wordCount: number;
}

// ─── SSE Types ───

export interface GenerationEvent {
  stage: GenerationStage;
  status: GenerationStatus;
  message: string;
  progress: number; // 0-100
  metadata?: {
    pageNumber?: number;
    thumbnailUrl?: string;
    estimatedTimeRemaining?: number;
  };
}

// ─── Book Preview Types ───

export interface BookPageView {
  pageNumber: number;
  type: PageType;
  text: string | null;
  textPosition: string | null;
  illustrationUrl: string | null;
  isApproved: boolean;
}

export interface BookPreviewData {
  id: string;
  title: string | null;
  childName: string;
  coverImageUrl: string | null;
  pages: BookPageView[];
  status: BookStatus;
}

// ─── Checkout Types ───

export interface CheckoutFormData {
  format: BookFormat;
  coverType: CoverType;
  shippingName: string;
  shippingAddress1: string;
  shippingAddress2?: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostalCode: string;
  shippingCountry: string;
}

export interface PriceBreakdown {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

// ─── API Response Types ───

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Theme/Style Config Types ───

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  storyPromptHint: string;
}

export interface IllustrationStyleConfig {
  id: IllustrationStyle;
  name: string;
  description: string;
  previewImage: string;
  fluxStylePrompt: string;
}

export interface PersonalityTrait {
  id: string;
  label: string;
  emoji: string;
  storyHint: string;
}
