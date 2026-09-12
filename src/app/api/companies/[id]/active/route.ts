import { routeError } from "@/lib/http/route-error";
import { NextResponse } from "next/server";
import { setCompanyActive } from "@/services/companies/company.service";
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { active } = await req.json();
    return NextResponse.json(await setCompanyActive(id, Boolean(active)));
  } catch (e) {
    return routeError(e);
  }
}
