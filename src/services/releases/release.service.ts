import "server-only";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";


export async function
recordRelease({
  version,
  actorId,
  gitCommit,
  notes,
}: {
  version:
    string;

  actorId?:
    string | null;

  gitCommit?:
    string | null;

  notes?:
    string | null;
}) {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "system_releases"
      )
      .insert({

        release_version:
          version,

        schema_version:
          "15.0",

        release_name:
          `HRAnalyst Placement Wing ${version}`,

        status:
          "deployed",

        deployed_by:
          actorId ??
          null,

        git_commit:
          gitCommit ??
          null,

        release_notes:
          notes ??
          null,

      })
      .select(
        "id,release_version"
      )
      .single();


  if (
    error ||
    !data
  ) {
    throw new Error(
      error?.message ??
      "Unable to record release"
    );
  }


  return data;
}


export async function
recordReleaseCheck({
  releaseId,
  checkType,
  status,
  details,
}: {
  releaseId:
    string;

  checkType:
    string;

  status:
    "pass"
    | "fail"
    | "warning";

  details?:
    Record<
      string,
      unknown
    >;
}) {

  const {
    error,
  } =
    await supabaseAdmin
      .from(
        "release_health_events"
      )
      .insert({

        release_id:
          releaseId,

        check_type:
          checkType,

        status,

        details:
          details ?? {},

      });


  if (error) {
    throw new Error(
      error.message
    );
  }
}