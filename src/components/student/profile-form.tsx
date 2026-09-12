"use client";
import { useState } from "react";
type P = Record<string, unknown>;
export default function ProfileForm({ profile }: { profile: P }) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const f = new FormData(e.currentTarget);
    const skills = String(f.get("skills") || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const body = {
      firstName: f.get("firstName"),
      lastName: f.get("lastName"),
      phone: f.get("phone"),
      headline: f.get("headline"),
      summary: f.get("summary"),
      city: f.get("city"),
      state: f.get("state"),
      country: f.get("country"),
      qualification: f.get("qualification"),
      graduationYear: f.get("graduationYear") || undefined,
      specialization: f.get("specialization"),
      totalExperienceMonths: f.get("totalExperienceMonths") || 0,
      currentCompany: f.get("currentCompany"),
      currentDesignation: f.get("currentDesignation"),
      currentCtc: f.get("currentCtc") || undefined,
      expectedCtc: f.get("expectedCtc") || undefined,
      noticePeriodDays: f.get("noticePeriodDays") || undefined,
      preferredRole: f.get("preferredRole") || undefined,
      preferredLocation: f.get("preferredLocation"),
      preferredWorkplaceType: f.get("preferredWorkplaceType") || undefined,
      willingToRelocate: f.get("willingToRelocate") === "on",
      availabilityStatus: f.get("availabilityStatus") || "available",
      linkedinUrl: f.get("linkedinUrl"),
      githubUrl: f.get("githubUrl"),
      portfolioUrl: f.get("portfolioUrl"),
      skills,
    };
    const r = await fetch("/api/student/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json();
    setMessage(
      r.ok
        ? `Profile saved (${j.profileCompletion}% complete)`
        : j.error || "Unable to save profile",
    );
    setSaving(false);
  }
  const input = "w-full rounded-lg border px-3 py-2";
  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["firstName", "First name", profile.first_name],
          ["lastName", "Last name", profile.last_name],
          ["phone", "Phone", profile.phone],
          ["headline", "Headline", profile.headline],
          ["city", "City", profile.city],
          ["state", "State", profile.state],
          ["country", "Country", profile.country],
          ["qualification", "Qualification", profile.qualification],
          ["graduationYear", "Graduation year", profile.graduation_year],
          ["specialization", "Specialization", profile.specialization],
          [
            "totalExperienceMonths",
            "Experience (months)",
            profile.total_experience_months,
          ],
          ["currentCompany", "Current company", profile.current_company],
          [
            "currentDesignation",
            "Current designation",
            profile.current_designation,
          ],
          ["currentCtc", "Current CTC", profile.current_ctc],
          ["expectedCtc", "Expected CTC", profile.expected_ctc],
          [
            "noticePeriodDays",
            "Notice period (days)",
            profile.notice_period_days,
          ],
          [
            "preferredLocation",
            "Preferred location",
            profile.preferred_location,
          ],
          ["linkedinUrl", "LinkedIn URL", profile.linkedin_url],
          ["githubUrl", "GitHub URL", profile.github_url],
          ["portfolioUrl", "Portfolio URL", profile.portfolio_url],
        ].map(([n, l, v]) => (
          <label key={String(n)} className="text-sm">
            <span className="mb-1 block font-medium">{String(l)}</span>
            <input
              className={input}
              name={String(n)}
              defaultValue={String(v ?? "")}
            />
          </label>
        ))}
        <label className="text-sm">
          <span className="mb-1 block font-medium">Preferred role</span>
          <select
            className={input}
            name="preferredRole"
            defaultValue={String(profile.preferred_role ?? "")}
          >
            <option value="">Select</option>
            <option>BA</option>
            <option>PO</option>
            <option>PM</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Workplace</span>
          <select
            className={input}
            name="preferredWorkplaceType"
            defaultValue={String(profile.preferred_workplace_type ?? "")}
          >
            <option value="">Any</option>
            <option value="onsite">Onsite</option>
            <option value="hybrid">Hybrid</option>
            <option value="remote">Remote</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Availability</span>
          <select
            className={input}
            name="availabilityStatus"
            defaultValue={String(profile.availability_status ?? "available")}
          >
            <option value="available">Available</option>
            <option value="interviewing">Interviewing</option>
            <option value="not_available">Not available</option>
          </select>
        </label>
        <label className="flex items-center gap-2 pt-7 text-sm">
          <input
            type="checkbox"
            name="willingToRelocate"
            defaultChecked={profile.willing_to_relocate === true}
          />
          <span>Willing to relocate</span>
        </label>
      </div>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Skills (comma separated)</span>
        <input
          className={input}
          name="skills"
          defaultValue={
            Array.isArray(profile.skills) ? profile.skills.join(", ") : ""
          }
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block font-medium">Professional summary</span>
        <textarea
          className={input}
          rows={6}
          name="summary"
          defaultValue={String(profile.summary ?? "")}
        />
      </label>
      <div className="flex items-center gap-4">
        <button
          disabled={saving}
          className="rounded-lg bg-slate-950 px-5 py-2.5 text-white disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
        {message && <p className="text-sm">{message}</p>}
      </div>
    </form>
  );
}
