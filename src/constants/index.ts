import type { ThemeConfig, IllustrationStyleConfig, PersonalityTrait } from "@/types";

// ─── Themes ───

export const THEMES: ThemeConfig[] = [
  {
    id: "adventure",
    icon: "🗺️",
    image: "/images/wizard/theme-adventure.png",
    color: "#f59e0b",
    storyPromptHint: "an exciting adventure with exploration, challenges to overcome, and hidden treasures",
  },
  {
    id: "friendship",
    icon: "🤝",
    image: "/images/wizard/theme-friendship.png",
    color: "#ec4899",
    storyPromptHint: "the power of friendship, making new friends, and learning to work together",
  },
  {
    id: "space",
    icon: "🚀",
    image: "/images/wizard/theme-space.png",
    color: "#FF6B6B",
    storyPromptHint: "a journey through outer space with rockets, planets, stars, and cosmic discoveries",
  },
  {
    id: "enchanted-forest",
    icon: "🌲",
    image: "/images/wizard/theme-enchanted-forest.png",
    color: "#22c55e",
    storyPromptHint: "a magical enchanted forest with talking animals, fairy lights, and woodland mysteries",
  },
  {
    id: "superheroes",
    icon: "⚡",
    image: "/images/wizard/theme-superheroes.png",
    color: "#ef4444",
    storyPromptHint: "discovering special superpowers, saving the day, and learning that everyone has unique strengths",
  },
  {
    id: "fairy-tale",
    icon: "👑",
    image: "/images/wizard/theme-fairy-tale.png",
    color: "#a855f7",
    storyPromptHint: "a classic fairy tale with castles, enchantments, and a happily-ever-after ending",
  },
  {
    id: "robots",
    icon: "🤖",
    image: "/images/wizard/theme-robots.png",
    color: "#64748b",
    storyPromptHint: "a world of friendly robots, amazing inventions, and learning how things work together",
  },
  {
    id: "underwater",
    icon: "🐠",
    image: "/images/wizard/theme-underwater.png",
    color: "#06b6d4",
    storyPromptHint: "an underwater adventure with colorful sea creatures, coral reefs, and ocean mysteries",
  },
  {
    id: "dinosaurs",
    icon: "🦕",
    image: "/images/wizard/theme-dinosaurs.png",
    color: "#84cc16",
    storyPromptHint: "a journey to a land of dinosaurs with gentle giants, exciting discoveries, and prehistoric wonders",
  },
];

// ─── Illustration Styles ───

export const ILLUSTRATION_STYLES: IllustrationStyleConfig[] = [
  {
    id: "WATERCOLOR",
    previewImage: "/images/wizard/style-watercolor.png",
    fluxStylePrompt: "soft watercolor children's book illustration style, dreamy washes, gentle color blending, delicate brushstrokes, whimsical and airy feel, pastel undertones with vibrant accents",
  },
  {
    id: "SOFT_ANIME",
    previewImage: "/images/wizard/style-soft-anime.png",
    fluxStylePrompt: "soft anime children's book illustration style, large expressive eyes, gentle pastel palette, smooth cel-shading, warm glow lighting, cute rounded character designs",
  },
  {
    id: "PAPER_COLLAGE",
    previewImage: "/images/wizard/style-paper-collage.png",
    fluxStylePrompt: "paper collage children's book illustration style, cut-out paper textures, layered handmade feel, torn edges, mixed media with fabric and paper patterns, tactile and craft-like",
  },
  {
    id: "PLAYFUL_3D",
    previewImage: "/images/wizard/style-playful-3d.png",
    fluxStylePrompt: "playful 3D animated children's book illustration style, soft rounded forms, vibrant colors, Pixar-inspired lighting, smooth plastic-like textures, cheerful and modern",
  },
  {
    id: "GOUACHE_PAINTERLY",
    previewImage: "/images/wizard/style-gouache.png",
    fluxStylePrompt: "gouache painterly children's book illustration style, rich opaque colors, visible brushwork, warm and earthy tones, cozy atmospheric lighting, traditional painted feel",
  },
  {
    id: "CLAYMATION",
    previewImage: "/images/wizard/style-claymation.png",
    fluxStylePrompt: "claymation children's book illustration style, sculpted clay characters, handcrafted textures, stop-motion animation feel, soft studio lighting, charming imperfections",
  },
  {
    id: "GEOMETRIC_MODERN",
    previewImage: "/images/wizard/style-geometric.png",
    fluxStylePrompt: "geometric modern children's book illustration style, clean flat shapes, bold color blocks, minimalist design, mid-century modern aesthetic, playful abstract compositions",
  },
  {
    id: "PICTURE_BOOK",
    previewImage: "/images/wizard/style-picture-book.png",
    fluxStylePrompt: "classic picture book illustration style, hand-drawn detailed linework, warm rich colors, traditional children's book art, nostalgic golden age illustration feel, cross-hatching details",
  },
  {
    id: "BLOCK_CRAFT",
    previewImage: "/images/wizard/style-block-craft.png",
    fluxStylePrompt: "block craft children's book illustration style, voxel-inspired blocky shapes, Minecraft-like world, bright primary colors, low-poly 3D feel, playful cubic characters",
  },
  {
    id: "KAWAII",
    previewImage: "/images/wizard/style-kawaii.png",
    fluxStylePrompt: "kawaii children's book illustration style, ultra-cute chibi characters, pastel rainbow palette, sparkles and stars, rounded soft shapes, Japanese cute culture aesthetic",
  },
  {
    id: "COMIC_POP",
    previewImage: "/images/wizard/style-comic-pop.png",
    fluxStylePrompt: "comic pop children's book illustration style, vivid saturated colors, strong clean outlines, halftone dots, dynamic action poses, bold graphic panels, comic book energy",
  },
  {
    id: "STICKER_ART",
    previewImage: "/images/wizard/style-sticker-art.png",
    fluxStylePrompt: "sticker art children's book illustration style, die-cut sticker look, white outlines, glossy finish, colorful flat design, playful scattered arrangement, vinyl sticker aesthetic",
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
  image?: string;
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
  { id: "birthday", emoji: "🎂", image: "/images/wizard/occasion-birthday.png" },
  { id: "holiday", emoji: "🎄", image: "/images/wizard/occasion-holiday.png" },
  { id: "just-because", emoji: "💫", image: "/images/wizard/occasion-just-because.png" },
  { id: "achievement", emoji: "🏆", image: "/images/wizard/occasion-achievement.png" },
  { id: "new-sibling", emoji: "👶", image: "/images/wizard/occasion-new-sibling.png" },
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

// ─── Age Range Options ───

export interface AgeRangeOption {
  id: string;
  emoji: string;
  image: string;
  label: string;
  comprehensionHint: string;
}

export const AGE_RANGE_OPTIONS: AgeRangeOption[] = [
  { id: "0-2", emoji: "👶", image: "/images/wizard/age-0-2.png", label: "0–2", comprehensionHint: "a baby or toddler (very simple words, sensory descriptions, repetitive patterns)" },
  { id: "3-5", emoji: "🧒", image: "/images/wizard/age-3-5.png", label: "3–5", comprehensionHint: "a preschooler (short sentences, familiar concepts, gentle humor, repetition)" },
  { id: "6-9", emoji: "📚", image: "/images/wizard/age-6-9.png", label: "6–9", comprehensionHint: "an early reader (longer sentences, simple plot twists, emerging vocabulary, cause-and-effect)" },
  { id: "10+", emoji: "🌟", image: "/images/wizard/age-10-plus.png", label: "10+", comprehensionHint: "a confident reader (richer vocabulary, multi-layered plots, nuanced emotions)" },
];

// ─── Subjects (per theme) ───

export const SUBJECTS: Record<string, OptionItem[]> = {
  "adventure": [
    { id: "treasure-hunt", emoji: "🗺️" },
    { id: "jungle-expedition", emoji: "🌴" },
    { id: "mountain-quest", emoji: "🏔️" },
    { id: "lost-city", emoji: "🏛️" },
    { id: "island-explorer", emoji: "🏝️" },
  ],
  "friendship": [
    { id: "new-friend", emoji: "🤗" },
    { id: "teamwork", emoji: "🤝" },
    { id: "pen-pals", emoji: "✉️" },
    { id: "neighborhood", emoji: "🏘️" },
    { id: "playdate-adventure", emoji: "🎪" },
  ],
  "space": [
    { id: "planet-hopper", emoji: "🪐" },
    { id: "astronaut-training", emoji: "👨‍🚀" },
    { id: "alien-friends", emoji: "👽" },
    { id: "moon-mission", emoji: "🌙" },
    { id: "space-station", emoji: "🛸" },
  ],
  "enchanted-forest": [
    { id: "talking-trees", emoji: "🌳" },
    { id: "fairy-ring", emoji: "🧚" },
    { id: "mushroom-village", emoji: "🍄" },
    { id: "enchanted-animals", emoji: "🦊" },
    { id: "hidden-waterfall", emoji: "💧" },
  ],
  "superheroes": [
    { id: "origin-story", emoji: "💥" },
    { id: "team-up", emoji: "🦸" },
    { id: "powers-discovery", emoji: "✨" },
    { id: "secret-identity", emoji: "🎭" },
    { id: "villain-reform", emoji: "💫" },
  ],
  "fairy-tale": [
    { id: "castle-quest", emoji: "🏰" },
    { id: "magic-mirror", emoji: "🪞" },
    { id: "enchanted-ball", emoji: "💃" },
    { id: "magic-beans", emoji: "🌱" },
    { id: "sleeping-spell", emoji: "😴" },
  ],
  "robots": [
    { id: "robot-friend", emoji: "🤖" },
    { id: "invention-lab", emoji: "🔬" },
    { id: "robot-school", emoji: "🏫" },
    { id: "rescue-bot", emoji: "🚒" },
    { id: "building-crew", emoji: "🔧" },
  ],
  "underwater": [
    { id: "coral-reef", emoji: "🪸" },
    { id: "pirate-ship", emoji: "🏴‍☠️" },
    { id: "mermaid-kingdom", emoji: "🧜" },
    { id: "deep-sea-dive", emoji: "🤿" },
    { id: "whale-song", emoji: "🐋" },
  ],
  "dinosaurs": [
    { id: "dino-park", emoji: "🦖" },
    { id: "fossil-hunt", emoji: "🦴" },
    { id: "baby-dino", emoji: "🥚" },
    { id: "time-travel", emoji: "⏰" },
    { id: "volcano-adventure", emoji: "🌋" },
  ],
};

// ─── Story Hearts ───

export const STORY_HEARTS: OptionItem[] = [
  { id: "courage", emoji: "🦁" },
  { id: "kindness", emoji: "💝" },
  { id: "self-belief", emoji: "🌟" },
  { id: "teamwork", emoji: "🤝" },
  { id: "creativity", emoji: "🎨" },
  { id: "perseverance", emoji: "💪" },
  { id: "empathy", emoji: "🫂" },
  { id: "gratitude", emoji: "🙏" },
  { id: "curiosity", emoji: "🔍" },
  { id: "acceptance", emoji: "🌈" },
];

// ─── Book Languages ───

export interface BookLanguage {
  code: string;
  flag: string;
  nativeName: string;
}

export const BOOK_LANGUAGES: BookLanguage[] = [
  { code: "en", flag: "🇬🇧", nativeName: "English" },
  { code: "he", flag: "🇮🇱", nativeName: "עברית" },
  { code: "fr", flag: "🇫🇷", nativeName: "Français" },
  { code: "es", flag: "🇪🇸", nativeName: "Español" },
  { code: "de", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "ar", flag: "🇸🇦", nativeName: "العربية" },
  { code: "ru", flag: "🇷🇺", nativeName: "Русский" },
  { code: "pt", flag: "🇧🇷", nativeName: "Português" },
  { code: "zh", flag: "🇨🇳", nativeName: "中文" },
  { code: "ja", flag: "🇯🇵", nativeName: "日本語" },
  { code: "ko", flag: "🇰🇷", nativeName: "한국어" },
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
