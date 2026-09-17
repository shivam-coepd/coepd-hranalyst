import { NextResponse } from "next/server";
import { z } from "zod";
import { AppError, routeError } from "@/lib/http/route-error";
import { applyToJob } from "@/services/applications/apply.service";
import { requireRole } from "@/lib/auth/guards";
const schema = z.object({ jobId: z.string().uuid() });
export async function POST(req: Request) {
  try {
    await requireRole("student");
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success)
      throw new AppError("Invalid job ID", 422, "VALIDATION_ERROR");
    return NextResponse.json(await applyToJob(parsed.data.jobId), {
      status: 201,
    });
  } catch (e) {
    return routeError(e);
  }
}
