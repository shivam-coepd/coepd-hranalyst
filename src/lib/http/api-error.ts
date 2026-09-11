import {
  NextResponse,
} from "next/server";

import {
  logger,
} from "@/lib/logging/logger";

export function
apiError(
  error:
    unknown,
  {
    requestId,
    fallback =
      "Request failed",
  }: {
    requestId?:
      string;
    fallback?:
      string;
  } = {}
) {

  const status =
    (
      error as
      {
        status?:
          number;
      }
    )?.status
    ??
    400;

  const message =
    error instanceof Error
      ? error.message
      : fallback;

  logger.error(
    "API request failed",
    {
      requestId,
      status,
      error:
        message,
    }
  );

  return NextResponse.json(
    {
      success:
        false,

      error:
        status >= 500
          ? fallback
          : message,

      requestId:
        requestId ??
        null,
    },
    {
      status,
    }
  );
}