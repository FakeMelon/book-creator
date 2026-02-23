import { z } from "zod";

// ─── Wizard Step Validators ───

export const childInfoSchema = z.object({
  childName: z
    .string()
    .min(1, "Name is required")
    .max(30, "Name must be 30 characters or less")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes"),
  childAge: z
    .number()
    .int()
    .min(3, "Age must be between 3 and 8")
    .max(8, "Age must be between 3 and 8"),
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
  hobbies: z.array(z.string()).max(5).optional(),
  favoriteCharacters: z.array(z.string()).max(3).optional(),
  favoriteAnimal: z.array(z.string()).max(3).optional(),
});

export const photoUploadSchema = z.object({
  photoFile: z.any().refine((file) => file !== null, "Please upload a photo"),
});

export const storyStyleSchema = z.object({
  storyStyle: z.enum(["PROSE", "RHYME"]),
  illustrationStyle: z.enum([
    "WATERCOLOR_WHIMSY",
    "BRIGHT_AND_BOLD",
    "STORYBOOK_CLASSIC",
    "COZY_AND_WARM",
  ]),
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
  childAge: z.number().int().min(3).max(8),
  childGender: z.string(),
  favoriteThings: z.array(z.string()).min(1).max(5),
  personalityTraits: z.array(z.string()).min(1).max(3),
  theme: z.string().min(1),
  occasion: z.string().min(1),
  hobbies: z.array(z.string()).max(5).optional(),
  favoriteCharacters: z.array(z.string()).max(3).optional(),
  favoriteAnimal: z.array(z.string()).max(3).optional(),
  storyStyle: z.enum(["PROSE", "RHYME"]),
  illustrationStyle: z.enum([
    "WATERCOLOR_WHIMSY",
    "BRIGHT_AND_BOLD",
    "STORYBOOK_CLASSIC",
    "COZY_AND_WARM",
  ]),
  dedication: z.string().max(200).optional(),
  childPhotoKey: z.string().min(1),
  childPhotoKeys: z.array(z.string()).optional(),
  additionalCharacters: z.array(additionalCharacterSchema).max(4).optional(),
  selectedTitle: z.string().min(1),
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

export const suggestTitlesSchema = z.object({
  childName: z.string().min(1),
  childAge: z.number().int().min(3).max(8),
  childGender: z.string(),
  theme: z.string().min(1),
  occasion: z.string().min(1),
  favoriteThings: z.array(z.string()).optional(),
  personalityTraits: z.array(z.string()).optional(),
  hobbies: z.array(z.string()).optional(),
  favoriteCharacters: z.array(z.string()).optional(),
  favoriteAnimal: z.array(z.string()).optional(),
});

// ─── Type exports ───

export type ChildInfoInput = z.infer<typeof childInfoSchema>;
export type CreativeDirectionInput = z.infer<typeof creativeDirectionSchema>;
export type StoryStyleInput = z.infer<typeof storyStyleSchema>;
export type CreateBookInput = z.infer<typeof createBookSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type SuggestTitlesInput = z.infer<typeof suggestTitlesSchema>;
