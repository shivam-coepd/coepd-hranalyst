import "server-only";
import { PDFParse } from "pdf-parse";
import type { CvParseResult } from "./types";

export async function parsePdf(buffer: Buffer): Promise<CvParseResult> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    const text = result.text.trim();
    return {
      text,
      metadata: {
        pageCount: result.total ?? undefined,
        wordCount: text.split(/\s+/).filter(Boolean).length,
        characterCount: text.length,
      },
    };
  } finally {
    await parser.destroy();
  }
}
