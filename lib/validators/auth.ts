import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(72)
});

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8).max(72)
});

const avatarSchema = z
  .string()
  .trim()
  .max(2_000_000)
  .refine(
    (value) => {
      if (!value) {
        return false;
      }

      if (value.startsWith("data:image/")) {
        return /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(value);
      }

      return /^https?:\/\//i.test(value);
    },
    { message: "Invalid avatar URL" }
  );

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    avatarUrl: avatarSchema.nullable().optional()
  })
  .refine((value) => value.name !== undefined || value.avatarUrl !== undefined, {
    message: "No profile fields to update"
  });
