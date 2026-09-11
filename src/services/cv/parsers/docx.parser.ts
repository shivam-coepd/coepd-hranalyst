import "server-only";

import mammoth from "mammoth";

import type {
  CvParseResult,
} from "./types";

export async function parseDocx(
  buffer: Buffer
): Promise<CvParseResult> {

  const result =
    await mammoth.extractRawText({
      buffer,
    });

  const text =
    result.value.trim();

  return {
    text,

    metadata: {
      wordCount:
        text
          .split(/\s+/)
          .filter(Boolean)
          .length,

      characterCount:
        text.length,
    },
  };
}

