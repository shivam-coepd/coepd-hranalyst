export interface RequirementMatch {

  requirementType:
    | "must_have"
    | "good_to_have"
    | "tool";

  requirementName:
    string;

  normalizedRequirement:
    string;

  matched:
    boolean;

  matchedCvTerm:
    string | null;

  method:
    | "exact"
    | "alias"
    | "normalized"
    | "semantic"
    | "manual"
    | "none";

  confidence:
    number;

  evidence:
    string | null;
}