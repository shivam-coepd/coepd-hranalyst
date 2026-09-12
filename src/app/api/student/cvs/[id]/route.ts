import { NextResponse } from "next/server";
import { routeError } from "@/lib/http/route-error";
import { deleteCv } from "@/services/cv/set-primary.service";
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return NextResponse.json(await deleteCv(id));
  } catch (e) {
    return routeError(e);
  }
}
