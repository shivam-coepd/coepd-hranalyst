import { NextResponse } from "next/server";
import { submitJobForChecklist } from "@/services/jobs/submit-job.service";
export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return NextResponse.json(await submitJobForChecklist(id));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Request failed" },
      { status: 400 },
    );
  }
}
