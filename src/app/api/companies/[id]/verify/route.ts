import { routeError } from "@/lib/http/route-error";
import { NextResponse } from "next/server";
import { verifyCompany } from "@/services/companies/company.service";
export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return NextResponse.json(await verifyCompany(id));
  } catch (e) {
    return routeError(e);
  }
}
