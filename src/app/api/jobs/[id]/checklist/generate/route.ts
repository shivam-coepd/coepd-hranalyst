import {
  NextResponse,
} from "next/server";

import {
  generateJobChecklist,
} from "@/services/checklists/generate-checklist.service";

export async function POST(
  _request: Request,

  context: {
    params:
      Promise<{
        id: string;
      }>;
  }
) {

  try {

    const {
      id,
    } =
      await context.params;

    const checklist =
      await generateJobChecklist(
        id
      );

    return NextResponse.json({
      success: true,
      data:
        checklist,
    });

  } catch (error) {

    return NextResponse.json(
      {
        success: false,

        message:
          error instanceof Error
            ? error.message
            : "Checklist generation failed",
      },
      {
        status: 400,
      }
    );
  }
}