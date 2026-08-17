// API response envelope helpers — single enforcement point.
import { NextResponse } from "next/server";

export function ok<T>(data: T, statusCode = 200) {
  return NextResponse.json(
    { status: true, statusCode, data },
    { status: statusCode }
  );
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
