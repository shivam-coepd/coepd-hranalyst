import { NextResponse } from "next/server";
import { routeError } from "@/lib/http/route-error";
import { completeCvUpload } from "@/services/cv/create-upload.service";
export async function POST(req: Request) {
  try {
    return NextResponse.json(await completeCvUpload(await req.json()), {
      status: 201,
    });
  } catch (e: any) {
    require("fs").writeFileSync("complete-error.log", e?.stack || e?.message || String(e));
    return routeError(e);
  }
}
