import { NextResponse } from "next/server";
import { routeError } from "@/lib/http/route-error";
import { updateChecklist } from "@/services/checklists/update-checklist.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await updateChecklist(id, body);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return routeError(error);
  }
}
