import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getFullName({
  firstName,
  lastName,
  fallback = "User",
}: {
  firstName?: string | null;

  lastName?: string | null;

  fallback?: string;
}) {
  const value = [firstName, lastName].filter(Boolean).join(" ").trim();

  return value || fallback;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
