import { NextResponse } from "next/server";
import { routeError } from "@/lib/http/route-error";
import { publishJob } from "@/services/jobs/publish-job.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await publishJob(id, body));
  } catch (error) {
    return routeError(error);
  }
}
