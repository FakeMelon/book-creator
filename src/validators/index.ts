import { z } from "zod";

const bookLanguages = ["en", "he", "fr", "es", "de", "ar", "ru", "pt", "zh", "ja", "ko"] as const;

const ageRanges = ["0-2", "3-5", "6-9", "10+"] as const;

const illustrationStyles = [
  "WATERCOLOR",
  "SOFT_ANIME",
  "PAPER_COLLAGE",
  "PLAYFUL_3D",
  "GOUACHE_PAINTERLY",
  "CLAYMATION",
  "GEOMETRIC_MODERN",
  "PICTURE_BOOK",
  "BLOCK_CRAFT",
  "KAWAII",
  "COMIC_POP",
  "STICKER_ART",
] as const;

// ─── Wizard Step Validators ───

export function createChildInfoSchema(t: (key: string) => string) {
  return z.object({
    childName: z
      .string()
      .min(1, t("nameRequired"))
      .max(30, t("nameMaxLength"))
      .regex(/^[\p{L}\s'-]+$/u, t("namePattern")),
    childAge: z.enum(ageRanges, {
      message: t("ageRange"),
    }),
    childGender: z.enum(["boy", "girl", "non-binary"], {
      message: t("selectOption"),
    }),
  });
}

export function createCreativeDirectionSchema(t: (key: string) => string) {
  return z.object({
    occasion: z.string().min(1, t("selectOccasion")),
    favoriteThings: z
      .array(z.string())
      .min(1, t("pickFavoriteThing"))
      .max(5, t("maxFavoriteThings")),
    personalityTraits: z
      .array(z.string())
      .min(1, t("pickTrait"))
      .max(3, t("maxTraits")),
    theme: z.string().min(1, t("chooseTheme")),
    subject: z.string().optional(),
    storyMessage: z.string().optional(),
    hobbies: z.array(z.string()).max(5).optional(),
    favoriteCharacters: z.array(z.string()).max(3).optional(),
    favoriteAnimal: z.array(z.string()).max(3).optional(),
  });
}

export function createPhotoUploadSchema(t: (key: string) => string) {
  return z.object({
    photoFile: z.any().refine((file) => file !== null, t("uploadPhoto")),
  });
}

export const photoUploadSchema = z.object({
  photoFile: z.any().refine((file) => file !== null, "Please upload a photo"),
});

export function createStoryStyleSchema(t: (key: string) => string) {
  return z.object({
    storyStyle: z.enum(["PROSE", "RHYME"]),
    illustrationStyle: z.enum(illustrationStyles),
    dedication: z.string().max(200, t("dedicationMaxLength")).optional(),
  });
}

// Static schemas (used by API routes — no translated messages needed)

export const childInfoSchema = z.object({
  childName: z
    .string()
    .min(1, "Name is required")
    .max(30, "Name must be 30 characters or less")
    .regex(/^[\p{L}\s'-]+$/u, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  childAge: z.enum(ageRanges, {
    message: "Please select an age range",
  }),
  childGender: z.enum(["boy", "girl", "non-binary"], {
    message: "Please select an option",
  }),
});

export const creativeDirectionSchema = z.object({
  occasion: z.string().min(1, "Please select an occasion"),
  favoriteThings: z
    .array(z.string())
    .min(1, "Pick at least one favorite thing")
    .max(5, "Pick up to 5 favorite things"),
  personalityTraits: z
    .array(z.string())
    .min(1, "Pick at least one trait")
    .max(3, "Pick up to 3 traits"),
  theme: z.string().min(1, "Please choose a theme"),
  subject: z.string().optional(),
  storyMessage: z.string().optional(),
  hobbies: z.array(z.string()).max(5).optional(),
  favoriteCharacters: z.array(z.string()).max(3).optional(),
  favoriteAnimal: z.array(z.string()).max(3).optional(),
});

export const storyStyleSchema = z.object({
  storyStyle: z.enum(["PROSE", "RHYME"]),
  illustrationStyle: z.enum(illustrationStyles),
  dedication: z.string().max(200, "Dedication must be 200 characters or less").optional(),
});

export const fullWizardSchema = childInfoSchema
  .merge(creativeDirectionSchema)
  .merge(storyStyleSchema)
  .extend({
    photoFile: z.any(),
  });

// ─── API Validators ───

export const additionalCharacterSchema = z.object({
  name: z.string().min(1).max(30),
  role: z.string().min(1),
  photoKey: z.string().nullable(),
});

export const createBookSchema = z.object({
  childName: z.string().min(1).max(30),
  childAge: z.enum(ageRanges, { message: "Please select an age range" }),
  childGender: z.string(),
  favoriteThings: z.array(z.string()).min(1).max(5),
  personalityTraits: z.array(z.string()).min(1).max(3),
  theme: z.string().min(1),
  occasion: z.string().min(1),
  subject: z.string().optional(),
  storyMessage: z.string().optional(),
  hobbies: z.array(z.string()).max(5).optional(),
  favoriteCharacters: z.array(z.string()).max(3).optional(),
  favoriteAnimal: z.array(z.string()).max(3).optional(),
  storyStyle: z.enum(["PROSE", "RHYME"]),
  illustrationStyle: z.enum(illustrationStyles),
  dedication: z.string().max(200).optional(),
  childPhotoKey: z.string().min(1),
  childPhotoKeys: z.array(z.string()).optional(),
  additionalCharacters: z.array(additionalCharacterSchema).max(4).optional(),
  selectedTitle: z.string().min(1),
  language: z.enum(bookLanguages, { message: "Unsupported language" }).optional(),
});

export const checkoutSchema = z.object({
  bookId: z.string().min(1),
  coverType: z.enum(["HARDCOVER", "SOFTCOVER"]),
  shippingName: z.string().min(1, "Name is required"),
  shippingAddress1: z.string().min(1, "Address is required"),
  shippingAddress2: z.string().optional(),
  shippingCity: z.string().min(1, "City is required"),
  shippingState: z.string().optional(),
  shippingPostalCode: z.string().min(1, "Postal code is required"),
  shippingCountry: z.string().min(2).max(2),
});

export const regeneratePageSchema = z.object({
  bookId: z.string().min(1),
  pageNumber: z.number().int().min(1).max(32),
});

export const updatePageTextSchema = z.object({
  bookId: z.string().min(1),
  pageNumber: z.number().int().min(1).max(32),
  text: z.string().min(1).max(500),
});

export const generateIdeasSchema = z.object({
  childName: z.string().min(1).max(30),
  childAge: z.enum(ageRanges, { message: "Please select an age range" }),
  childGender: z.enum(["boy", "girl", "non-binary"], {
    message: "Please select an option",
  }),
  personalityTraits: z.array(z.string()).min(1).max(3),
  theme: z.string().min(1),
  occasion: z.string().min(1),
  subject: z.string().optional(),
  storyMessage: z.string().optional(),
  hobbies: z.array(z.string()).max(5).optional(),
  favoriteCharacters: z.array(z.string()).max(3).optional(),
  favoriteAnimal: z.array(z.string()).max(3).optional(),
  favoriteFoods: z.array(z.string()).max(3).optional(),
  storyStyle: z.enum(["PROSE", "RHYME"], {
    message: "Please select a story style",
  }),
  illustrationStyle: z.enum(illustrationStyles, {
    message: "Please select an illustration style",
  }),
  language: z.enum(bookLanguages, { message: "Unsupported language" }).optional(),
});

export type GenerateIdeasInput = z.infer<typeof generateIdeasSchema>;

// ─── Type exports ───

export type ChildInfoInput = z.infer<typeof childInfoSchema>;
export type CreativeDirectionInput = z.infer<typeof creativeDirectionSchema>;
export type StoryStyleInput = z.infer<typeof storyStyleSchema>;
export type CreateBookInput = z.infer<typeof createBookSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
