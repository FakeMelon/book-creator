import type { ThemeConfig, IllustrationStyleConfig, PersonalityTrait } from "@/types";

// ─── Themes ───

export const THEMES: ThemeConfig[] = [
  {
    id: "adventure",
    name: "Adventure",
    description: "Epic quests and brave discoveries",
    icon: "🗺️",
    color: "#f59e0b",
    storyPromptHint: "an exciting adventure with exploration, challenges to overcome, and hidden treasures",
  },
  {
    id: "friendship",
    name: "Friendship",
    description: "Making friends and working together",
    icon: "🤝",
    color: "#ec4899",
    storyPromptHint: "the power of friendship, making new friends, and learning to work together",
  },
  {
    id: "space",
    name: "Space",
    description: "Rockets, planets, and cosmic wonders",
    icon: "🚀",
    color: "#6366f1",
    storyPromptHint: "a journey through outer space with rockets, planets, stars, and cosmic discoveries",
  },
  {
    id: "enchanted-forest",
    name: "Enchanted Forest",
    description: "Magical woods full of wonder",
    icon: "🌲",
    color: "#22c55e",
    storyPromptHint: "a magical enchanted forest with talking animals, fairy lights, and woodland mysteries",
  },
  {
    id: "superheroes",
    name: "Superheroes",
    description: "Discover your special powers",
    icon: "⚡",
    color: "#ef4444",
    storyPromptHint: "discovering special superpowers, saving the day, and learning that everyone has unique strengths",
  },
  {
    id: "fairy-tale",
    name: "Fairy Tale",
    description: "Once upon a time magic",
    icon: "👑",
    color: "#a855f7",
    storyPromptHint: "a classic fairy tale with castles, enchantments, and a happily-ever-after ending",
  },
];

// ─── Illustration Styles ───

export const ILLUSTRATION_STYLES: IllustrationStyleConfig[] = [
  {
    id: "WATERCOLOR_WHIMSY",
    name: "Watercolor Whimsy",
    description: "Soft, dreamy watercolor textures with gentle color blending",
    previewImage: "/images/style-watercolor.jpg",
    fluxStylePrompt: "soft watercolor children's book illustration style, dreamy washes, gentle color blending, delicate brushstrokes, whimsical and airy feel, pastel undertones with vibrant accents",
  },
  {
    id: "BRIGHT_AND_BOLD",
    name: "Bright & Bold",
    description: "Vivid colors and strong outlines, modern and energetic",
    previewImage: "/images/style-bold.jpg",
    fluxStylePrompt: "bright bold children's book illustration style, vivid saturated colors, strong clean outlines, flat design with playful shapes, modern energetic feel, graphic and punchy",
  },
  {
    id: "STORYBOOK_CLASSIC",
    name: "Storybook Classic",
    description: "Timeless hand-drawn feel, warm and nostalgic",
    previewImage: "/images/style-classic.jpg",
    fluxStylePrompt: "classic storybook illustration style, hand-drawn detailed linework, warm rich colors, traditional children's book art, nostalgic golden age illustration feel, cross-hatching details",
  },
  {
    id: "COZY_AND_WARM",
    name: "Cozy & Warm",
    description: "Soft lighting, rounded shapes, comforting atmosphere",
    previewImage: "/images/style-cozy.jpg",
    fluxStylePrompt: "cozy warm children's book illustration style, soft golden lighting, rounded friendly shapes, gentle gradients, comforting atmosphere, slightly textured background, warm color palette with earth tones",
  },
];

// ─── Personality Traits ───

export const PERSONALITY_TRAITS: PersonalityTrait[] = [
  { id: "brave", label: "Brave", emoji: "🦁", storyHint: "shows courage and faces fears" },
  { id: "curious", label: "Curious", emoji: "🔍", storyHint: "loves to explore and ask questions" },
  { id: "kind", label: "Kind", emoji: "💝", storyHint: "shows compassion and helps others" },
  { id: "funny", label: "Funny", emoji: "😄", storyHint: "makes others laugh and finds humor in things" },
  { id: "creative", label: "Creative", emoji: "🎨", storyHint: "loves to imagine and create new things" },
];

// ─── Favorite Things ───

export const FAVORITE_THINGS_OPTIONS = [
  "Animals", "Dinosaurs", "Space", "Music", "Art",
];

// ─── New Category Options ───

export const OCCASION_OPTIONS = [
  "Birthday", "Holiday", "Just Because", "Achievement", "New Sibling",
];

export const HOBBY_OPTIONS = [
  "Drawing", "Sports", "Music", "Building", "Outdoor Play",
];

export const CHARACTER_OPTIONS = [
  "Superheroes", "Princesses", "Dinosaurs", "Animals", "Robots",
];

export const ANIMAL_OPTIONS = [
  "Dog", "Cat", "Bunny", "Horse", "Dolphin",
];

export const CHARACTER_ROLE_OPTIONS = [
  "Mom", "Dad", "Sister", "Brother", "Pet", "Friend", "Grandparent",
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
  {
    stage: "STORY_GENERATION" as const,
    label: "Writing the Story",
    description: "Claude is crafting a magical tale just for {childName}...",
    icon: "✍️",
  },
  {
    stage: "SAFETY_REVIEW" as const,
    label: "Quality Review",
    description: "Making sure everything is perfect and age-appropriate...",
    icon: "✅",
  },
  {
    stage: "CHARACTER_DESIGN" as const,
    label: "Designing the Character",
    description: "Transforming {childName}'s photo into a storybook character...",
    icon: "🎨",
  },
  {
    stage: "PAGE_ILLUSTRATIONS" as const,
    label: "Illustrating Pages",
    description: "Painting page {pageNumber} of {totalPages}...",
    icon: "🖼️",
  },
  {
    stage: "PDF_ASSEMBLY" as const,
    label: "Assembling the Book",
    description: "Putting all the pages together into a beautiful book...",
    icon: "📖",
  },
  {
    stage: "QUALITY_CHECK" as const,
    label: "Final Check",
    description: "One last look to make sure everything is perfect...",
    icon: "🔍",
  },
];
