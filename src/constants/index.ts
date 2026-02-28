import type { ThemeConfig, IllustrationStyleConfig, PersonalityTrait } from "@/types";

// ─── Themes ───

export const THEMES: ThemeConfig[] = [
  {
    id: "adventure",
    icon: "🗺️",
    color: "#f59e0b",
    storyPromptHint: "an exciting adventure with exploration, challenges to overcome, and hidden treasures",
  },
  {
    id: "friendship",
    icon: "🤝",
    color: "#ec4899",
    storyPromptHint: "the power of friendship, making new friends, and learning to work together",
  },
  {
    id: "space",
    icon: "🚀",
    color: "#FF6B6B",
    storyPromptHint: "a journey through outer space with rockets, planets, stars, and cosmic discoveries",
  },
  {
    id: "enchanted-forest",
    icon: "🌲",
    color: "#22c55e",
    storyPromptHint: "a magical enchanted forest with talking animals, fairy lights, and woodland mysteries",
  },
  {
    id: "superheroes",
    icon: "⚡",
    color: "#ef4444",
    storyPromptHint: "discovering special superpowers, saving the day, and learning that everyone has unique strengths",
  },
  {
    id: "fairy-tale",
    icon: "👑",
    color: "#a855f7",
    storyPromptHint: "a classic fairy tale with castles, enchantments, and a happily-ever-after ending",
  },
  {
    id: "robots",
    icon: "🤖",
    color: "#64748b",
    storyPromptHint: "a world of friendly robots, amazing inventions, and learning how things work together",
  },
  {
    id: "underwater",
    icon: "🐠",
    color: "#06b6d4",
    storyPromptHint: "an underwater adventure with colorful sea creatures, coral reefs, and ocean mysteries",
  },
  {
    id: "dinosaurs",
    icon: "🦕",
    color: "#84cc16",
    storyPromptHint: "a journey to a land of dinosaurs with gentle giants, exciting discoveries, and prehistoric wonders",
  },
];

// ─── Illustration Styles ───

export const ILLUSTRATION_STYLES: IllustrationStyleConfig[] = [
  {
    id: "WATERCOLOR_WHIMSY",
    previewImage: "/images/style-watercolor.jpg",
    fluxStylePrompt: "soft watercolor children's book illustration style, dreamy washes, gentle color blending, delicate brushstrokes, whimsical and airy feel, pastel undertones with vibrant accents",
  },
  {
    id: "BRIGHT_AND_BOLD",
    previewImage: "/images/style-bold.jpg",
    fluxStylePrompt: "bright bold children's book illustration style, vivid saturated colors, strong clean outlines, flat design with playful shapes, modern energetic feel, graphic and punchy",
  },
  {
    id: "STORYBOOK_CLASSIC",
    previewImage: "/images/style-classic.jpg",
    fluxStylePrompt: "classic storybook illustration style, hand-drawn detailed linework, warm rich colors, traditional children's book art, nostalgic golden age illustration feel, cross-hatching details",
  },
  {
    id: "COZY_AND_WARM",
    previewImage: "/images/style-cozy.jpg",
    fluxStylePrompt: "cozy warm children's book illustration style, soft golden lighting, rounded friendly shapes, gentle gradients, comforting atmosphere, slightly textured background, warm color palette with earth tones",
  },
];

// ─── Personality Traits ───

export const PERSONALITY_TRAITS: PersonalityTrait[] = [
  { id: "brave", emoji: "🦁", storyHint: "shows courage and faces fears" },
  { id: "curious", emoji: "🔍", storyHint: "loves to explore and ask questions" },
  { id: "kind", emoji: "💝", storyHint: "shows compassion and helps others" },
  { id: "funny", emoji: "😄", storyHint: "makes others laugh and finds humor in things" },
  { id: "creative", emoji: "🎨", storyHint: "loves to imagine and create new things" },
];

// ─── Option types ───

export interface OptionItem {
  id: string;
  emoji: string;
}

// ─── Favorite Things ───

export const FAVORITE_THINGS_OPTIONS: OptionItem[] = [
  { id: "animals", emoji: "🐾" },
  { id: "dinosaurs", emoji: "🦕" },
  { id: "space", emoji: "🚀" },
  { id: "music", emoji: "🎵" },
  { id: "art", emoji: "🎨" },
];

// ─── Occasion Options ───

export const OCCASION_OPTIONS: OptionItem[] = [
  { id: "birthday", emoji: "🎂" },
  { id: "holiday", emoji: "🎄" },
  { id: "just-because", emoji: "💫" },
  { id: "achievement", emoji: "🏆" },
  { id: "new-sibling", emoji: "👶" },
];

// ─── Hobby Options ───

export const HOBBY_OPTIONS: OptionItem[] = [
  { id: "drawing", emoji: "🎨" },
  { id: "sports", emoji: "⚽" },
  { id: "music", emoji: "🎵" },
  { id: "building", emoji: "🧱" },
  { id: "outdoor-play", emoji: "🌳" },
];

// ─── Character Options ───

export const CHARACTER_OPTIONS: OptionItem[] = [
  { id: "superheroes", emoji: "⚡" },
  { id: "princesses", emoji: "👑" },
  { id: "dinosaurs", emoji: "🦕" },
  { id: "animals", emoji: "🐾" },
  { id: "robots", emoji: "🤖" },
];

// ─── Animal Options ───

export const ANIMAL_OPTIONS: OptionItem[] = [
  { id: "dog", emoji: "🐶" },
  { id: "cat", emoji: "🐱" },
  { id: "bunny", emoji: "🐰" },
  { id: "horse", emoji: "🐴" },
  { id: "dolphin", emoji: "🐬" },
];

// ─── Food Options ───

export const FOOD_OPTIONS: OptionItem[] = [
  { id: "pizza", emoji: "🍕" },
  { id: "ice-cream", emoji: "🍦" },
  { id: "pasta", emoji: "🍝" },
  { id: "chocolate", emoji: "🍫" },
  { id: "pancakes", emoji: "🥞" },
];

// ─── Character Role Options ───

export const CHARACTER_ROLE_OPTIONS: OptionItem[] = [
  { id: "mom", emoji: "👩" },
  { id: "dad", emoji: "👨" },
  { id: "sister", emoji: "👧" },
  { id: "brother", emoji: "👦" },
  { id: "pet", emoji: "🐾" },
  { id: "friend", emoji: "🧒" },
  { id: "grandparent", emoji: "👴" },
];

// ─── Referral Sources ───

export const REFERRAL_SOURCE_OPTIONS = [
  "google",
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "friend",
  "tv",
  "pinterest",
  "email",
  "podcast",
  "other",
];

// ─── Book Specs ───

export const BOOK_SPECS = {
  SQUARE_8X8: {
    width: 8,
    height: 8,
    widthPx: 2550, // 8.5" x 300 DPI (includes bleed)
    heightPx: 2550,
    bleedPx: 75, // 0.25" x 300 DPI
    dpi: 300,
  },
  LANDSCAPE_8X10: {
    width: 10,
    height: 8,
    widthPx: 3150,
    heightPx: 2550,
    bleedPx: 75,
    dpi: 300,
  },
} as const;

export const TOTAL_PAGES = 32;
export const ILLUSTRATED_PAGES = 16;

// ─── Pricing (in cents) ───

export const PRICING = {
  SOFTCOVER_8X8: 2499,
  HARDCOVER_8X8: 3499,
  HARDCOVER_8X10: 3999,
  RUSH_PROCESSING: 999,
  GIFT_WRAPPING: 499,
  AUDIO_NARRATION: 499,
} as const;

export const PRINT_COSTS = {
  SOFTCOVER_8X8: 650,
  HARDCOVER_8X8: 1050,
  HARDCOVER_8X10: 1200,
} as const;

// ─── Generation Stages ───

export const GENERATION_STAGES = [
  { stage: "STORY_GENERATION" as const, icon: "✍️" },
  { stage: "SAFETY_REVIEW" as const, icon: "✅" },
  { stage: "CHARACTER_DESIGN" as const, icon: "🎨" },
  { stage: "PAGE_ILLUSTRATIONS" as const, icon: "🖼️" },
  { stage: "PDF_ASSEMBLY" as const, icon: "📖" },
  { stage: "QUALITY_CHECK" as const, icon: "🔍" },
];
