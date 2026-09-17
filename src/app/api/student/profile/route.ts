import { NextResponse } from "next/server";
import { routeError } from "@/lib/http/route-error";
import { updateStudentProfile } from "@/services/students/update-profile.service";
export async function PATCH(req: Request) {
  try {
    return NextResponse.json(await updateStudentProfile(await req.json()));
  } catch (e) {
    return routeError(e);
  }
}
