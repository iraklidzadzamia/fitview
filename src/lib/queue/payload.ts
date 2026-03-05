import { z } from "zod";

export const tryOnCategorySchema = z.enum(["upper_body", "lower_body", "dresses"]);

export const tryOnJobSchema = z.object({
  tryonId: z.string().min(1),
  storeId: z.string().min(1),
  personImageUrl: z.string().url(),
  garmentImageUrl: z.string().url(),
  category: tryOnCategorySchema
});

export type TryOnCategory = z.infer<typeof tryOnCategorySchema>;
export type TryOnJobData = z.infer<typeof tryOnJobSchema>;
