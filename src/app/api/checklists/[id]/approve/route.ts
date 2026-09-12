import { NextResponse } from "next/server";
import { routeError } from "@/lib/http/route-error";
import { approveChecklist } from "@/services/checklists/approve-checklist.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return NextResponse.json(await approveChecklist(id));
  } catch (error) {
    return routeError(error);
  }
}
