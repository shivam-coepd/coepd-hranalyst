export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  count: number;
}
