import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";
import type { PerfSeedManifest } from "./types";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.PERF_TEST_USER_PASSWORD;
if (!supabaseUrl || !serviceRole) {
  throw new Error("Supabase performance environment is not configured");
}
if (!password || password.length < 16) {
  throw new Error("PERF_TEST_USER_PASSWORD must be at least 16 characters");
}
if (process.env.PERF_TEST_ENABLED !== "true") {
  throw new Error("PERF_TEST_ENABLED=true is required");
}
if (
  process.env.NODE_ENV === "production" &&
  process.env.ALLOW_PRODUCTION_PERF_TEST !== "true"
) {
  throw new Error("Refusing to seed production environment");
}
const studentCount = Number(process.env.PERF_STUDENT_COUNT ?? 1000);
const jobCount = Number(process.env.PERF_JOB_COUNT ?? 100);
const applicationCount = Number(process.env.PERF_APPLICATION_COUNT ?? 10000);
if (studentCount < 1 || studentCount > 5000) {
  throw new Error("PERF_STUDENT_COUNT must be between 1 and 5000");
}
if (jobCount < 1 || jobCount > 1000) {
  throw new Error("PERF_JOB_COUNT must be between 1 and 1000");
}
const supabase = createClient<Database>(supabaseUrl, serviceRole, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
const manifest: PerfSeedManifest = {
  createdAt: new Date().toISOString(),
  companyIds: [],
  jobIds: [],
  studentUserIds: [],
  studentProfileIds: [],
  applicationIds: [],
  feedJobId: null,
};
function chunk<T>(input: T[], size: number) {
  const output: T[][] = [];
  for (let i = 0; i < input.length; i += size) {
    output.push(input.slice(i, i + size));
  }
  return output;
}
async function saveManifest() {
  const directory = path.join(process.cwd(), "performance", "generated");
  await fs.mkdir(directory, {
    recursive: true,
  });
  await fs.writeFile(
    path.join(directory, "seed-manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  );
}
async function getRoleId(role: string) {
  const { data, error } = await supabase
    .from("roles")
    .select("id")
    .eq("name", role)
    .single();
  if (error || !data) {
    throw new Error(`Role ${role} not found`);
  }
  return data.id;
}
async function createCompanies() {
  console.log("Creating performance companies...");
  const companies = Array.from(
    {
      length: 10,
    },
    (_, index) => ({
      name: `[PERF] Company ${index + 1}`,
      code: `PERF-COMP-${String(index + 1).padStart(3, "0")}`,
      domain: `perf-company-${index + 1}.invalid`,
      website: `https://perf-company-${index + 1}.invalid`,
      industry: index % 2 === 0 ? "Banking" : "Technology",
      size: "500-1000",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      verification_status: "verified",
      is_active: true,
    }),
  );
  const { data, error } = await supabase
    .from("companies")
    .insert(companies)
    .select("id");
  if (error) {
    throw new Error(error.message);
  }
  manifest.companyIds = (data ?? []).map((item) => item.id);
}
async function createJobs() {
  console.log("Creating performance jobs...");
  const now = new Date();
  const jobs = Array.from(
    {
      length: jobCount,
    },
    (_, index) => {
      const companyId = manifest.companyIds[index % manifest.companyIds.length];
      const roleTypes = ["BA", "PO", "PM"];
      return {
        job_code: `PERF-JOB-${String(index + 1).padStart(4, "0")}`,
        company_id: companyId,
        job_title: `[PERF] ${roleTypes[index % 3]} Role ${index + 1}`,
        role_type: roleTypes[index % 3],
        location_type: "domestic",
        location: "Pune, Maharashtra",
        country: "India",
        employment_type: "full_time",
        workplace_type:
          index % 3 === 0 ? "remote" : index % 3 === 1 ? "hybrid" : "onsite",
        experience_min_months: 24,
        experience_max_months: 72,
        salary_min: 600000,
        salary_max: 1800000,
        salary_currency: "INR",
        openings: 5,
        jd_text:
          "Performance test Business Analyst role requiring requirement elicitation, user stories, stakeholder management, Jira, Agile and domain understanding.",
        status: "published",
        published_at: new Date(now.getTime() - index * 60000).toISOString(),
        application_deadline: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10),
      };
    },
  );
  for (const batch of chunk(jobs, 100)) {
    const { data, error } = await supabase
      .from("jobs")
      .insert(batch as never)
      .select("id");
    if (error) {
      throw new Error(error.message);
    }
    manifest.jobIds.push(...(data ?? []).map((row) => row.id));
  }
  manifest.feedJobId = manifest.jobIds[0] ?? null;
}
async function createStudents() {
  console.log(`Creating ${studentCount} performance students...`);
  const studentRoleId = await getRoleId("student");
  for (let index = 0; index < studentCount; index++) {
    const token = crypto.randomBytes(4).toString("hex");
    const email = `perf-student-${index + 1}-${token}@example.invalid`;
    const { data: authResult, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          first_name: "Perf",
          last_name: `Student ${index + 1}`,
        },
      });
    if (authError || !authResult.user) {
      throw new Error(
        authError?.message ?? "Failed to create performance user",
      );
    }
    const userId = authResult.user.id;
    manifest.studentUserIds.push(userId);
    const { error: profileUpdateError } = await supabase
      .from("profiles")
      .update({
        account_status: "approved",
      })
      .eq("id", userId);
    if (profileUpdateError) {
      throw new Error(profileUpdateError.message);
    }
    const { error: roleError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role_id: studentRoleId,
      assigned_by: userId,
    });
    if (roleError) {
      throw new Error(roleError.message);
    }
    const { data: studentProfile, error: studentError } = await supabase
      .from("student_profiles")
      .insert({
        user_id: userId,
        enrollment_id: `PERF-${String(index + 1).padStart(6, "0")}`,
        verification_status: "verified",
        verification_source: "performance_seed",
        verification_at: new Date().toISOString(),
        first_name: "Perf",
        last_name: `Student ${index + 1}`,
        phone: `900${String(index).padStart(7, "0")}`,
        location: "Pune",
        city: "Pune",
        state: "Maharashtra",
        country: "India",
        total_experience_months: 24 + (index % 60),
        current_company: "Performance Company",
        current_designation: "Business Analyst",
        notice_period_days: 30,
        profile_completion: 100,
      })
      .select("id")
      .single();
    if (studentError || !studentProfile) {
      throw new Error(
        studentError?.message ?? "Unable to create student profile",
      );
    }
    manifest.studentProfileIds.push(studentProfile.id);
    if ((index + 1) % 50 === 0) {
      console.log(`Created ${index + 1}/${studentCount} students`);
      await saveManifest();
    }
  }
}
async function createApplications() {
  console.log("Creating application load data...");
  const rows = [];
  const maxPossible =
    manifest.studentProfileIds.length * manifest.jobIds.length;
  const target = Math.min(applicationCount, maxPossible);
  let cursor = 0;
  outer: for (const studentId of manifest.studentProfileIds) {
    for (const jobId of manifest.jobIds) {
      rows.push({
        job_id: jobId,
        student_id: studentId,
        status:
          cursor % 5 === 0
            ? "verified"
            : cursor % 5 === 1
              ? "verification_pending"
              : cursor % 5 === 2
                ? "submitted_to_client"
                : cursor % 5 === 3
                  ? "shortlisted"
                  : "applied",
        match_score: 60 + (cursor % 40),
        ats_score: 55 + (cursor % 45),
        score_status: "completed",
      });
      cursor++;
      if (cursor >= target) {
        break outer;
      }
    }
  }
  for (const batch of chunk(rows, 500)) {
    const { data, error } = await supabase
      .from("applications")
      .insert(batch as never)
      .select("id");
    if (error) {
      throw new Error(error.message);
    }
    manifest.applicationIds.push(...(data ?? []).map((row) => row.id));
  }
}
async function main() {
  await createCompanies();
  await saveManifest();
  await createJobs();
  await saveManifest();
  await createStudents();
  await saveManifest();
  await createApplications();
  await saveManifest();
  console.log(
    JSON.stringify(
      {
        companies: manifest.companyIds.length,
        jobs: manifest.jobIds.length,
        students: manifest.studentProfileIds.length,
        applications: manifest.applicationIds.length,
      },
      null,
      2,
    ),
  );
}
main().catch(async (error) => {
  console.error(error);
  await saveManifest();
  process.exit(1);
});
