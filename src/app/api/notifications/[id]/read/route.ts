import {
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@/lib/supabase/server";

import {
  requireUser,
} from "@/lib/auth/guards";

export async function POST(
  _request:
    Request,
  context: {
    params:
      Promise<{
        id: string;
      }>;
  }
) {

  try {

    await requireUser();

    const {
      id,
    } =
      await context.params;

    const supabase =
      await createClient();

    const {
      error,
    } =
      await supabase.rpc(
        "mark_notification_read",
        {
          p_notification_id:
            id,
        }
      );

    if (error) {
      throw new Error(
        error.message
      );
    }

    return NextResponse.json({
      success: true,
    });

  } catch (error) {

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unable to update notification",
      },
      {
        status: 400,
      }
    );
  }
}