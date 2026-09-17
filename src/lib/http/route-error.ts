import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
    public readonly code = "BAD_REQUEST",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function routeError(error: unknown) {
  if (error instanceof ZodError)
    return NextResponse.json(
      { success: false, error: "Invalid request", code: "VALIDATION_ERROR" },
      { status: 422 },
    );
  if (
    error &&
    typeof error === "object" &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT;")
  ) {
    const forbidden = !error.digest.includes("/login;");
    return NextResponse.json(
      {
        success: false,
        error: forbidden ? "Access denied" : "Authentication required",
      },
      { status: forbidden ? 403 : 401 },
    );
  }
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.status >= 500 ? "Request failed" : error.message,
        code: error.code,
      },
      { status: error.status },
    );
  }

  console.error("Request failed", {
    name: error instanceof Error ? error.name : "UnknownError",
  });
  return NextResponse.json(
    {
      success: false,
      error: "An unexpected server error occurred",
      code: "INTERNAL_ERROR",
    },
    { status: 500 },
  );
}
