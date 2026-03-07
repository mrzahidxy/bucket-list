import { NextResponse } from "next/server";

export const ok = <T>(data: T, status = 200): NextResponse => NextResponse.json({ data }, { status });

type FailOptions = {
  code?: string;
  details?: unknown;
};

export const fail = (message: string, status = 400, options: FailOptions = {}): NextResponse =>
  NextResponse.json(
    {
      error: {
        message,
        ...(options.code ? { code: options.code } : {}),
        ...(options.details !== undefined ? { details: options.details } : {})
      }
    },
    { status }
  );
