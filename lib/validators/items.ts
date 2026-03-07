import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

export const createItemSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(500).optional(),
  dueDate: z.string().datetime().optional(),
  assignedTo: objectIdSchema.optional()
});

export const updateItemSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    description: z.string().trim().max(500).nullable().optional(),
    completed: z.boolean().optional(),
    dueDate: z.string().datetime().nullable().optional(),
    assignedTo: objectIdSchema.nullable().optional()
  })
  .refine((v) => Object.keys(v).length > 0, "No update fields provided");
