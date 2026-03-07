import { z } from "zod";

export const createListSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional()
});

export const updateListSchema = z
  .object({
    title: z.string().trim().min(1).max(120).optional(),
    description: z.string().trim().max(500).nullable().optional()
  })
  .refine((v) => Object.keys(v).length > 0, "No update fields provided");
