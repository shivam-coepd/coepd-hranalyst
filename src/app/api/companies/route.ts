import { routeError } from "@/lib/http/route-error";
import { NextResponse } from "next/server";
import { createCompany } from "@/services/companies/company.service";
import { getCompanies } from "@/repositories/companies.repository";
export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    return NextResponse.json(
      await getCompanies({
        status: u.searchParams.get("status") || undefined,
        search: u.searchParams.get("q") || undefined,
      }),
    );
  } catch (e) {
    return routeError(e);
  }
}
export async function POST(req: Request) {
  try {
    return NextResponse.json(await createCompany(await req.json()), {
      status: 201,
    });
  } catch (e) {
    return routeError(e);
  }
}
