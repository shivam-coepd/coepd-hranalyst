import { z } from "zod";
import type { Json } from "@/types/database";

/** Validate unknown boundary data before sending it to a JSONB column/RPC. */
export function toJson(value: unknown): Json {
  return z.json().parse(value);
}
