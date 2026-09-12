import { routeError } from "@/lib/http/route-error";
import { NextResponse } from "next/server";
import { rejectCompany } from "@/services/companies/company.service";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { reason } = await req.json();
    return NextResponse.json(await rejectCompany(id, String(reason ?? "")));
  } catch (e) {
    return routeError(e);
  }
}
