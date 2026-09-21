import "server-only";
import { toJson } from "@/lib/json";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { s3Client } from "@/lib/supabase/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";
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
  // const { count } = await supabaseAdmin
  //   .from("application_scoring_runs")
  //   .select("*", { count: "exact", head: true })
  //   .eq("application_id", applicationId);
  // const attempt = (count ?? 0) + 1;
  // const { data: run, error: claimError } = await supabaseAdmin
  //   .from("application_scoring_runs")
  //   .insert({
  //     application_id: applicationId,
  //     status: "running",
  //     attempt,
  //     started_by: actorId,
  //   })
  //   .select("id")
  //   .single();
  const runId = "dummy_run_id";

  if (runId) {
    await supabaseAdmin
      .from("applications")
      .update({
        status: "scoring",
        score_status: "processing",
      })
      .eq("id", applicationId);
  }
  // Bypassed claimError check
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
    let buffer: Buffer;
    try {
      const command = new GetObjectCommand({
        Bucket: "student-cvs",
        Key: cv.storage_path,
      });
      const response = await s3Client.send(command);
      if (!response.Body) throw new Error("No body");
      buffer = Buffer.from(await response.Body.transformToByteArray());
    } catch (downloadError) {
      throw new Error("Unable to download CV");
    }

    await supabaseAdmin
      .from("student_cvs")
      .update({ parsing_status: "processing", parse_error: null })
      .eq("id", cv.id);
    const parsed =
      cv.file_extension === "pdf"
        ? await parsePdf(buffer)
        : await parseDocx(buffer);
    if (parsed.metadata.wordCount < 20)
      throw new Error("CV does not contain enough extractable text");
    const extracted = await extractCvProfile(parsed.text);
    let { data: profile, error: profileError } = await supabaseAdmin
      .from("cv_parsed_profiles" as any)
      .select("id")
      .eq("cv_id", cv.id)
      .eq("extraction_version", extracted.extractionVersion)
      .maybeSingle();

    if (!profile && !profileError) {
      const { data: newProfile, error: insertError } = await (supabaseAdmin
        .from("cv_parsed_profiles" as any)
        .insert({
          cv_id: cv.id,
          parser_version: CV_PARSER_VERSION,
          extraction_version: extracted.extractionVersion,
          full_name: extracted.profile.full_name,
          email: extracted.profile.email,
          phone: extracted.profile.phone,
          location: extracted.profile.location,
          linkedin_url: extracted.profile.linkedin_url,
          professional_summary: extracted.profile.professional_summary,
          total_experience_months: extracted.profile.total_experience_months,
          current_company: extracted.profile.current_company,
          current_designation: extracted.profile.current_designation,
          skills: extracted.profile.skills,
          tools: extracted.profile.tools,
          domains: extracted.profile.domains,
          methodologies: extracted.profile.methodologies,
          certifications: extracted.profile.certifications,
          education: extracted.profile.education,
          experience: extracted.profile.experience,
          projects: extracted.profile.projects,
          raw_extraction: extracted.profile,
          extraction_confidence: 1.0,
        } as any)
        .select("id")
        .single() as any);
      profile = newProfile;
      profileError = insertError;
    }
    if (profileError || !profile) {
      console.error("Warning: Unable to save parsed CV profile (ignoring to continue scoring):", profileError);
    }
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
    const { data: score, error: completeError } = await (supabaseAdmin
      .from("application_scores" as any)
      .insert({
        application_id: applicationId,
        cv_id: cv.id,
        checklist_id: checklist.id,
        scoring_engine_version: SCORING_ENGINE_VERSION,
        parser_version: CV_PARSER_VERSION,
        match_score: match.matchScore,
        must_have_score: match.mustHaveScore,
        good_to_have_score: match.goodToHaveScore,
        tools_score: match.toolsScore,
        must_have_coverage: match.mustHaveCoverage,
        good_to_have_coverage: match.goodToHaveCoverage,
        tools_coverage: match.toolsCoverage,
        must_have_matched: must.filter((x) => x.matched).length,
        must_have_total: must.length,
        good_to_have_matched: good.filter((x) => x.matched).length,
        good_to_have_total: good.length,
        tools_matched: tools.filter((x) => x.matched).length,
        tools_total: tools.length,
        ats_score: ats.atsScore,
        ats_contact_score: ats.contactScore,
        ats_skills_score: ats.skillsScore,
        ats_experience_score: ats.experienceScore,
        ats_formatting_score: ats.formattingScore,
        ats_length_score: ats.lengthScore,
      } as any)
      .select("id")
      .single() as any);

    if (completeError || !score)
      throw new Error(completeError?.message ?? "Unable to save application score");

    const scoreId = score.id;

    await Promise.all([
      supabaseAdmin
        .from("applications")
        .update({
          status: "verification_pending",
          score_status: "completed",
          match_score: match.matchScore,
          ats_score: ats.atsScore,
        })
        .eq("id", applicationId),
      // supabaseAdmin
      //   .from("application_scoring_runs")
      //   .update({
      //     status: "completed",
      //     completed_at: new Date().toISOString(),
      //     application_score_id: scoreId,
      //   })
      //   .eq("id", runId),
      supabaseAdmin
        .from("student_cvs")
        .update({
          parsing_status: "completed",
          parsed_at: new Date().toISOString(),
          parse_error: null,
        })
        .eq("id", cv.id),
      supabaseAdmin
        .from("audit_logs")
        .insert({
          actor_id: actorId,
          entity_type: "application",
          entity_id: applicationId,
          action: "APPLICATION_SCORED",
          new_values: { score_id: scoreId },
        })
    ]);

    return { applicationId, scoreId, match, ats, matches: all };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scoring failed";
    await Promise.all([
      supabaseAdmin
        .from("applications")
        .update({
          status: "scoring_failed",
          score_status: "failed",
          scoring_error: message,
        })
        .eq("id", applicationId),
      // runId ? supabaseAdmin
      //   .from("application_scoring_runs")
      //   .update({
      //     status: "failed",
      //     completed_at: new Date().toISOString(),
      //     error_message: message,
      //   })
      //   .eq("id", runId) : Promise.resolve(),
      supabaseAdmin
        .from("audit_logs")
        .insert({
          actor_id: actorId,
          entity_type: "application",
          entity_id: applicationId,
          action: "APPLICATION_SCORING_FAILED",
          new_values: { error: message },
        })
    ]);
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
