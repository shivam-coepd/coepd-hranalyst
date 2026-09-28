import "server-only";
import { createHash } from "node:crypto";
import { getOpenAIClient } from "@/lib/openai/client";
import { AppError } from "@/lib/http/route-error";
import { CvExtractionSchema } from "./cv-extraction.schema";
import { CV_EXTRACTION_VERSION } from "@/services/scoring/versions";

const SYSTEM_PROMPT = `Extract only facts explicitly supported by this CV. Do not invent skills, tools, domains, dates, employers, certifications, education, experience or contact details. Use empty strings or arrays when absent. Evidence must be a short supporting phrase from the CV. Normalize skill/tool names without changing meaning. total_experience_months must be conservative and derived only from stated work history. Return ONLY valid JSON matching the requested schema.

Return a JSON object with the following structure:
{
  "full_name": "...",
  "email": "...",
  "phone": "...",
  "location": "...",
  "linkedin_url": "...",
  "professional_summary": "...",
  "total_experience_months": 0,
  "current_company": "...",
  "current_designation": "...",
  "skills": [{"name": "...", "normalized_name": "...", "evidence": "...", "confidence": 0}],
  "tools": [{"name": "...", "normalized_name": "...", "evidence": "...", "confidence": 0}],
  "domains": [{"name": "...", "normalized_name": "...", "evidence": "...", "confidence": 0}],
  "methodologies": [{"name": "...", "normalized_name": "...", "evidence": "...", "confidence": 0}],
  "certifications": ["..."],
  "education": [{"qualification": "...", "institution": "...", "year": "..."}],
  "experience": [{
    "company": "...", 
    "designation": "...", 
    "start_date": "...", 
    "end_date": "...", 
    "duration_months": 0,
    "responsibilities": ["..."],
    "skills": ["..."],
    "tools": ["..."]
  }],
  "projects": [{
    "name": "...",
    "description": "...",
    "skills": ["..."],
    "tools": ["..."]
  }]
}`;

export async function extractCvProfile(parsedCvText: string) {
  const model = process.env.OPENAI_MODEL || "gpt-6-sol";

  if (!parsedCvText.trim())
    throw new AppError("CV contains no extractable text", 422, "CV_TEXT_EMPTY");

  const client = getOpenAIClient();

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: parsedCvText.slice(0, 120000) },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content)
    throw new AppError(
      "CV extraction returned no text output",
      502,
      "CV_EXTRACTION_FAILED",
    );

  let parsedJson;
  try {
    parsedJson = JSON.parse(content);
  } catch (err) {
    throw new AppError(
      "CV extraction returned invalid JSON",
      502,
      "CV_EXTRACTION_FAILED",
    );
  }

  const profile = CvExtractionSchema.parse(parsedJson);

  return {
    profile,
    model,
    responseId: response.id || "unknown-response-id",
    extractionVersion: CV_EXTRACTION_VERSION,
    textSha256: createHash("sha256").update(parsedCvText).digest("hex"),
  };
}
