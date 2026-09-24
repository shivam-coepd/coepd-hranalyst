import type { CvExtraction } from "@/services/cv/cv-extraction.schema";
import type { RequirementMatch } from "./types";
import { canonicalTerm, termTokens } from "./normalize-term";
type Requirement = {
  name?: string;
  skill?: string;
};
type Evidence = {
  term: string;
  normalized: string;
  evidence: string | null | undefined;
  confidence: number | null | undefined;
};
type BestMatch = Evidence & { sim: number; exact: boolean };
function similarity(req: string, cvSkill: string) {
  const reqTokens = termTokens(req),
    cvTokens = termTokens(cvSkill);
  if (!reqTokens.size || !cvTokens.size) return 0;
  
  let common = 0;
  for (const x of cvTokens) if (reqTokens.has(x)) common++;
  
  const baseSim = common / Math.max(reqTokens.size, cvTokens.size);
  
  // If the requirement is a compound sentence/phrase, check if the CV skill is a subset
  if (reqTokens.size >= 3) {
    const subsetSim = common / cvTokens.size;
    // If the CV skill is at least 1 token and fully contained in the requirement, it's a strong match
    if (subsetSim === 1) return 1;
    return Math.max(baseSim, subsetSim * 0.8);
  }
  
  return baseSim;
}
export function matchRequirements(
  requirements: unknown[],
  type: RequirementMatch["requirementType"],
  cv: CvExtraction,
): RequirementMatch[] {
  const evidence = [
    ...cv.skills,
    ...cv.tools,
    ...cv.domains,
    ...cv.methodologies,
  ].map((x) => ({
    term: x.name,
    normalized: x.normalized_name || canonicalTerm(x.name),
    evidence: x.evidence,
    confidence: x.confidence,
  }));
  return requirements.map((raw) => {
    const requirement =
      raw && typeof raw === "object" ? (raw as Requirement) : {};
    const name = String(
      requirement.skill ?? requirement.name ?? raw ?? "",
    ).trim();
    const normalized = canonicalTerm(name);
    let best: BestMatch | null = null;
    for (const item of evidence) {
      const exact = canonicalTerm(item.normalized) === normalized;
      const sim = exact ? 1 : similarity(normalized, item.normalized);
      if (!best || sim > best.sim) best = { ...item, sim, exact };
    }
    const matched = best !== null && best.sim >= 0.75;
    const matchedBest = matched ? best : null;
    return {
      requirementType: type,
      requirementName: name,
      normalizedRequirement: normalized,
      matched,
      matchedCvTerm: matchedBest?.term ?? null,
      method: matchedBest
        ? matchedBest.exact
          ? "exact"
          : "normalized"
        : "none",
      confidence: matched
        ? Math.max(
            Math.min(matchedBest?.confidence ?? matchedBest?.sim ?? 0, 1),
            0,
          )
        : 0,
      evidence: matchedBest?.evidence ?? null,
    };
  });
}
