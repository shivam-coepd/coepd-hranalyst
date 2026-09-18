import "server-only";
import { createHash } from "node:crypto";
import { getGeminiClient } from "@/lib/gemini/client";
import { Type } from "@google/genai";
import { AppError } from "@/lib/http/route-error";
import { CvExtractionSchema } from "./cv-extraction.schema";
import { CV_EXTRACTION_VERSION } from "@/services/scoring/versions";

const SYSTEM_PROMPT = `Extract only facts explicitly supported by this CV. Do not invent skills, tools, domains, dates, employers, certifications, education, experience or contact details. Use empty strings or arrays when absent. Evidence must be a short supporting phrase from the CV. Normalize skill/tool names without changing meaning. total_experience_months must be conservative and derived only from stated work history. Return ONLY valid JSON matching the requested schema.`;

export async function extractCvProfile(parsedCvText: string) {
  const model = process.env.GEMINI_CV_MODEL?.trim();
  if (!model)
    throw new AppError(
      "CV extraction model is not configured",
      503,
      "AI_NOT_CONFIGURED",
    );
  if (!parsedCvText.trim())
    throw new AppError("CV contains no extractable text", 422, "CV_TEXT_EMPTY");

  const client = getGeminiClient();

  const response = await client.models.generateContent({
    model,
    contents: parsedCvText.slice(0, 120000),
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          full_name: { type: Type.STRING },
          email: { type: Type.STRING },
          phone: { type: Type.STRING },
          location: { type: Type.STRING },
          linkedin_url: { type: Type.STRING },
          professional_summary: { type: Type.STRING },
          total_experience_months: { type: Type.INTEGER },
          current_company: { type: Type.STRING },
          current_designation: { type: Type.STRING },
          skills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                normalized_name: { type: Type.STRING },
                evidence: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ["name", "normalized_name", "evidence", "confidence"]
            }
          },
          tools: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                normalized_name: { type: Type.STRING },
                evidence: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ["name", "normalized_name", "evidence", "confidence"]
            }
          },
          domains: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                normalized_name: { type: Type.STRING },
                evidence: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ["name", "normalized_name", "evidence", "confidence"]
            }
          },
          methodologies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                normalized_name: { type: Type.STRING },
                evidence: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ["name", "normalized_name", "evidence", "confidence"]
            }
          },
          certifications: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                qualification: { type: Type.STRING },
                institution: { type: Type.STRING },
                year: { type: Type.STRING }
              },
              required: ["qualification", "institution", "year"]
            }
          },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                designation: { type: Type.STRING },
                start_date: { type: Type.STRING },
                end_date: { type: Type.STRING },
                duration_months: { type: Type.INTEGER },
                responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                tools: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["company", "designation", "start_date", "end_date", "duration_months", "responsibilities", "skills", "tools"]
            }
          },
          projects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                tools: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "description", "skills", "tools"]
            }
          }
        },
        required: [
          "full_name", "email", "phone", "location", "linkedin_url",
          "professional_summary", "total_experience_months", "current_company",
          "current_designation", "skills", "tools", "domains", "methodologies",
          "certifications", "education", "experience", "projects"
        ]
      }
    },
  });

  if (!response.text)
    throw new AppError(
      "CV extraction returned no text output",
      502,
      "CV_EXTRACTION_FAILED",
    );

  let parsedJson;
  try {
    parsedJson = JSON.parse(response.text);
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
    responseId: response.modelVersion || "unknown-response-id",
    extractionVersion: CV_EXTRACTION_VERSION,
    textSha256: createHash("sha256").update(parsedCvText).digest("hex"),
  };
}
