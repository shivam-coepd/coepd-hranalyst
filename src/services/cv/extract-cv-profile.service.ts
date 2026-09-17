import "server-only";
import { createHash } from "node:crypto";
import { zodTextFormat } from "openai/helpers/zod";
import { getOpenAIClient } from "@/lib/openai/client";
import { AppError } from "@/lib/http/route-error";
import { CvExtractionSchema } from "./cv-extraction.schema";
import { CV_EXTRACTION_VERSION } from "@/services/scoring/versions";

const SYSTEM_PROMPT = `Extract only facts explicitly supported by this CV. Do not invent skills, tools, domains, dates, employers, certifications, education, experience or contact details. Use empty strings or arrays when absent. Evidence must be a short supporting phrase from the CV. Normalize skill/tool names without changing meaning. total_experience_months must be conservative and derived only from stated work history.`;

export async function extractCvProfile(parsedCvText: string) {
  const model = process.env.OPENAI_CV_MODEL?.trim();
  if (!model)
    throw new AppError(
      "CV extraction model is not configured",
      503,
      "AI_NOT_CONFIGURED",
    );
  if (!parsedCvText.trim())
    throw new AppError("CV contains no extractable text", 422, "CV_TEXT_EMPTY");
  const response = await getOpenAIClient().responses.parse({
    model,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: parsedCvText.slice(0, 120000) },
    ],
    text: { format: zodTextFormat(CvExtractionSchema, "cv_profile") },
  });
  if (!response.output_parsed)
    throw new AppError(
      "CV extraction returned no structured profile",
      502,
      "CV_EXTRACTION_FAILED",
    );
  return {
    profile: response.output_parsed,
    model,
    responseId: response.id,
    extractionVersion: CV_EXTRACTION_VERSION,
    textSha256: createHash("sha256").update(parsedCvText).digest("hex"),
  };
}
