import { NextResponse } from "next/server";
import { routeError } from "@/lib/http/route-error";
import { createCvUpload } from "@/services/cv/create-upload.service";
export async function POST(req: Request) {
  try {
    return NextResponse.json(await createCvUpload(await req.json()));
  } catch (e) {
    return routeError(e);
  }
}
