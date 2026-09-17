export function extractEmailDomain(email: string) {
  return email.trim().toLowerCase().split("@")[1] ?? null;
}

export const PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "rediffmail.com",
  "icloud.com",
]);
