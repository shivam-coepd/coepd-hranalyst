import { NextResponse } from "next/server";
import { createJob } from "@/services/jobs/create-job.service";
import { getJobs } from "@/repositories/jobs.repository";
export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    return NextResponse.json(
      await getJobs({
        status: u.searchParams.get("status") || undefined,
        companyId: u.searchParams.get("companyId") || undefined,
        search: u.searchParams.get("q") || undefined,
      }),
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Request failed" },
      { status: 400 },
    );
  }
}
export async function POST(req: Request) {
  try {
    return NextResponse.json(await createJob(await req.json()), {
      status: 201,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Request failed" },
      { status: 400 },
    );
  }
}
