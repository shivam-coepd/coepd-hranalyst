import { requireAdmin } from "@/lib/auth/guards";
import { getUsers } from "@/repositories/users.repository";

export async function listUsers(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await requireAdmin();
  return getUsers(params);
}
