// API response envelope helpers — single enforcement point.
import { NextResponse } from "next/server";

export function ok<T>(data: T, statusCode = 200) {
  return NextResponse.json(
    { status: true, statusCode, data },
    { status: statusCode }
  );
}

// A malformed body must not escape as an unhandled 500 — callers get null and
// return a proper envelope.
export async function readJson<T = Record<string, unknown>>(
  request: Request
): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function fail(
  code: string,
  details?: Record<string, unknown>,
  message?: string,
  statusCode = 400
) {
  const humanMessage =
    message ?? code.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

  return NextResponse.json(
    {
      status: false,
      statusCode,
      message: humanMessage,
      error: { code, ...(details ? { details } : {}) },
    },
    { status: statusCode }
  );
}
