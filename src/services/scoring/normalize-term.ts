const ALIASES: Record<string, string> = {
  "business requirements document": "brd",
  "functional requirements document": "frd",
  "user story": "user stories",
  "requirement elicitation": "requirements elicitation",
  "stakeholder management": "stakeholder management",
  "microsoft excel": "excel",
  "ms excel": "excel",
  powerbi: "power bi",
  "azure devops": "azure devops",
  "jira software": "jira",
  "structured query language": "sql",
  "product owner": "product owner",
  "business analyst": "business analyst",
};
export function basicNormalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .replace(/\s+/g, " ");
}
export function canonicalTerm(value: string) {
  const n = basicNormalize(value);
  return ALIASES[n] ?? n;
}
export function termTokens(value: string) {
  return new Set(canonicalTerm(value).split(" ").filter(Boolean));
}
