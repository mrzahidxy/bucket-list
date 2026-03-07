import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  APP_URL: z.string().url(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  MOCK_EMAIL: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional()
});

const isTest = process.env.NODE_ENV === "test";

const parsed = envSchema.safeParse({
  MONGODB_URI: process.env.MONGODB_URI ?? (isTest ? "mongodb://127.0.0.1:27017/bucketlist_test" : undefined),
  JWT_SECRET: process.env.JWT_SECRET ?? (isTest ? "test-secret-at-least-32-characters-long" : undefined),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  APP_URL: process.env.APP_URL ?? (isTest ? "http://localhost:3000" : undefined),
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM,
  MOCK_EMAIL: process.env.MOCK_EMAIL ?? "true",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
});

if (!parsed.success) {
  const fields = Object.keys(parsed.error.flatten().fieldErrors).join(", ");
  throw new Error(`Invalid environment configuration. Missing/invalid: ${fields}`);
}

export const env = parsed.data;
