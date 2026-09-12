import "server-only";
import { toJson } from "@/lib/json";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AppError } from "@/lib/http/route-error";
import { requireServiceRole } from "@/lib/auth/service-guard";
import { parsePdf } from "@/services/cv/parsers/pdf.parser";
import { parseDocx } from "@/services/cv/parsers/docx.parser";
import { extractCvProfile } from "@/services/cv/extract-cv-profile.service";
import { matchRequirements } from "./match-requirements";
import { calculateMatchScore } from "./calculate-match";
import { calculateAtsScore } from "./calculate-ats";
import { CV_PARSER_VERSION, SCORING_ENGINE_VERSION } from "./versions";
export async function processApplicationInternal(
  applicationId: string,
  actorId: string,
) {
  const { data: runId, error: claimError } = await supabaseAdmin.rpc(
    "begin_application_scoring",
    {
      p_application_id: applicationId,
      p_actor_id: actorId,
    },
  );
  if (claimError || !runId)
    throw new AppError(
      claimError?.message ?? "Unable to start scoring",
      409,
      "SCORING_START_FAILED",
    );
  try {
    const { data: app, error } = await supabaseAdmin
      .from("applications")
      .select(
        "id,cv_id,checklist_id,student_id,student_cvs(id,storage_path,file_extension),job_checklists(id,must_have,good_to_have,tools),jobs(assigned_placement_hr)",
      )
      .eq("id", applicationId)
      .single();
    if (error || !app) throw new Error("Application scoring inputs not found");
    const cv = Array.isArray(app.student_cvs)
      ? app.student_cvs[0]
      : app.student_cvs;
    const checklist = Array.isArray(app.job_checklists)
      ? app.job_checklists[0]
      : app.job_checklists;
    const { data: file, error: downloadError } = await supabaseAdmin.storage
      .from("student-cvs")
      .download(cv.storage_path);
    if (downloadError || !file) throw new Error("Unable to download CV");
    await supabaseAdmin
      .from("student_cvs")
      .update({ parsing_status: "processing", parse_error: null })
      .eq("id", cv.id);
    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed =
      cv.file_extension === "pdf"
        ? await parsePdf(buffer)
        : await parseDocx(buffer);
    if (parsed.metadata.wordCount < 20)
      throw new Error("CV does not contain enough extractable text");
    const extracted = await extractCvProfile(parsed.text);
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("parsed_cv_profiles")
      .upsert(
        {
          cv_id: cv.id,
          parser_version: CV_PARSER_VERSION,
          extraction_version: extracted.extractionVersion,
          raw_text: parsed.text,
          raw_text_sha256: extracted.textSha256,
          page_count: parsed.metadata.pageCount ?? null,
          word_count: parsed.metadata.wordCount,
          character_count: parsed.metadata.characterCount,
          extracted_profile: extracted.profile,
          ai_model: extracted.model,
          ai_response_id: extracted.responseId,
        },
        { onConflict: "cv_id,raw_text_sha256,extraction_version" },
      )
      .select("id")
      .single();
    if (profileError || !profile)
      throw new Error("Unable to save parsed CV profile");
    const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
    const must = matchRequirements(
      arr(checklist.must_have),
      "must_have",
      extracted.profile,
    );
    const good = matchRequirements(
      arr(checklist.good_to_have),
      "good_to_have",
      extracted.profile,
    );
    const tools = matchRequirements(
      arr(checklist.tools),
      "tool",
      extracted.profile,
    );
    const all = [...must, ...good, ...tools];
    const match = calculateMatchScore({
      mustHave: {
        matched: must.filter((x) => x.matched).length,
        total: must.length,
      },
      goodToHave: {
        matched: good.filter((x) => x.matched).length,
        total: good.length,
      },
      tools: {
        matched: tools.filter((x) => x.matched).length,
        total: tools.length,
      },
    });
    const ats = calculateAtsScore(extracted.profile, parsed.text);
    const { data: scoreId, error: completeError } = await supabaseAdmin.rpc(
      "complete_application_scoring",
      {
        p_application_id: applicationId,
        p_run_id: runId,
        p_actor_id: actorId,
        p_parsed_cv_profile_id: profile.id,
        p_match: toJson(match),
        p_ats: toJson(ats),
        p_engine_version: SCORING_ENGINE_VERSION,
        p_matches: toJson(all),
      },
    );
    if (completeError || !scoreId)
      throw new Error(completeError?.message ?? "Unable to complete scoring");
    await supabaseAdmin
      .from("student_cvs")
      .update({
        parsing_status: "completed",
        parsed_at: new Date().toISOString(),
        parse_error: null,
      })
      .eq("id", cv.id);
    return { applicationId, scoreId, match, ats, matches: all };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scoring failed";
    await supabaseAdmin.rpc("fail_application_scoring", {
      p_application_id: applicationId,
      p_run_id: runId,
      p_actor_id: actorId,
      p_error: message,
    });
    throw error instanceof AppError
      ? error
      : new AppError("Application scoring failed", 500, "SCORING_FAILED");
  }
}
export async function processApplication(applicationId: string) {
  const user = await requireServiceRole([
    "super_admin",
    "admin",
    "placement_hr",
  ]);
  return processApplicationInternal(applicationId, user.id);
}
