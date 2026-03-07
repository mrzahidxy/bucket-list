import { NextRequest } from "next/server";
import { ZodType, z } from "zod";
import { badRequest } from "@/lib/server/api/errors";

export const getRequestIp = (request: NextRequest): string => request.headers.get("x-forwarded-for") ?? "unknown";

export const readJsonBody = async <T>(request: NextRequest, invalidMessage = "Invalid JSON payload"): Promise<T> => {
  const body = (await request.json().catch(() => null)) as T | null;
  if (body === null) {
    throw badRequest(invalidMessage);
  }

  return body;
};

export const parseJsonBody = async <TSchema extends ZodType>(
  request: NextRequest,
  schema: TSchema,
  invalidMessage: string
): Promise<z.infer<TSchema>> => {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw badRequest(invalidMessage, { code: "VALIDATION_ERROR", details: parsed.error.flatten() });
  }

  return parsed.data;
};

export const resolveParams = async <T>(params: Promise<T>): Promise<T> => params;
