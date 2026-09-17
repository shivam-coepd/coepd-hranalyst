import type { CvExtraction } from "@/services/cv/cv-extraction.schema";
export function calculateAtsScore(cv: CvExtraction, rawText: string) {
  let contact = 0;
  if (cv.full_name) contact += 4;
  if (cv.email) contact += 5;
  if (cv.phone) contact += 5;
  if (cv.location) contact += 3;
  if (cv.linkedin_url) contact += 3;
  const skillCount = new Set([
    ...cv.skills.map((x) => x.normalized_name || x.name),
    ...cv.tools.map((x) => x.normalized_name || x.name),
  ]).size;
  const skills = Math.min(
    30,
    skillCount >= 12
      ? 30
      : skillCount >= 8
        ? 25
        : skillCount >= 5
          ? 20
          : skillCount >= 3
            ? 14
            : skillCount > 0
              ? 8
              : 0,
  );
  const months = cv.total_experience_months;
  const experience =
    months >= 60
      ? 20
      : months >= 36
        ? 18
        : months >= 24
          ? 16
          : months >= 12
            ? 13
            : months > 0
              ? 8
              : cv.projects.length
                ? 5
                : 0;
  const lines = rawText
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
  const longLines = lines.filter((x) => x.length > 220).length;
  const formatting = Math.max(
    0,
    Math.min(
      15,
      15 - Math.min(8, longLines * 2) - (rawText.includes("�") ? 5 : 0),
    ),
  );
  const words = rawText.split(/\s+/).filter(Boolean).length;
  const length =
    words >= 350 && words <= 1100
      ? 15
      : words >= 250 && words <= 1400
        ? 12
        : words >= 150 && words <= 1800
          ? 8
          : words >= 80
            ? 5
            : 2;
  return {
    atsScore: +Math.min(
      100,
      contact + skills + experience + formatting + length,
    ).toFixed(2),
    contactScore: contact,
    skillsScore: skills,
    experienceScore: experience,
    formattingScore: formatting,
    lengthScore: length,
  };
}
