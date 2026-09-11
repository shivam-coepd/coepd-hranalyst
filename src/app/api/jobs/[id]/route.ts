import { NextResponse } from "next/server";
import { getJobById } from "@/repositories/jobs.repository";
import { updateJob } from "@/services/jobs/update-job.service";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return NextResponse.json(await getJobById(id));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Request failed" },
      { status: 404 },
    );
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return NextResponse.json(await updateJob(id, await req.json()));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Request failed" },
      { status: 400 },
    );
  }
}
