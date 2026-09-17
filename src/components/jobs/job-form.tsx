"use client";
import { useActionState } from "react";
import type { State } from "@/app/placement-hr/jobs/new/actions";
type Company = { id: string; name: string };
type Hr = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
};
export default function JobForm({
  action,
  companies,
  placementHrs,
  lockedCompanyId,
  lockedPlacementHrId,
  defaults = {},
}: {
  action: (s: State, f: FormData) => Promise<State>;
  companies: Company[];
  placementHrs: Hr[];
  lockedCompanyId?: string;
  lockedPlacementHrId?: string;
  defaults?: Record<string, string | number | null | undefined>;
}) {
  const [state, formAction, pending] = useActionState(action, {
    success: false,
    message: "",
  });
  
  // Merge defaults with returned form fields to preserve data on error
  const initialValues = { ...defaults, ...(state.fields || {}) };

  return (
    <form action={formAction} className="mt-6 grid gap-4 md:grid-cols-2">
      <label>
        <span className="mb-1 block text-sm font-medium">Company</span>
        {lockedCompanyId ? (
          <>
            <input
              type="text"
              readOnly
              disabled
              className="w-full rounded border px-3 py-2 bg-slate-50 text-slate-500"
              value={companies.find((c) => c.id === lockedCompanyId)?.name || ""}
            />
            <input type="hidden" name="companyId" value={lockedCompanyId} />
          </>
        ) : (
          <select
            name="companyId"
            defaultValue={String(initialValues.companyId ?? "")}
            className="w-full rounded border px-3 py-2"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Job title</span>
        <input
          name="jobTitle"
          defaultValue={String(initialValues.jobTitle ?? "")}
          required
          className="w-full rounded border px-3 py-2"
        />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Role</span>
        <select
          name="roleType"
          defaultValue={String(initialValues.roleType ?? "BA")}
          className="w-full rounded border px-3 py-2"
        >
          {["BA", "PO", "PM", "SM"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Placement HR</span>
        {lockedPlacementHrId ? (
          <>
            <input
              type="text"
              readOnly
              disabled
              className="w-full rounded border px-3 py-2 bg-slate-50 text-slate-500"
              value={
                placementHrs
                  .filter((h) => h.id === lockedPlacementHrId)
                  .map((h) => [h.first_name, h.last_name].filter(Boolean).join(" ") || h.email)[0] || ""
              }
            />
            <input type="hidden" name="assignedPlacementHr" value={lockedPlacementHrId} />
          </>
        ) : (
          <select
            name="assignedPlacementHr"
            defaultValue={String(initialValues.assignedPlacementHr ?? "")}
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Unassigned</option>
            {placementHrs.map((h) => (
              <option key={h.id} value={h.id}>
                {[h.first_name, h.last_name].filter(Boolean).join(" ") || h.email}
              </option>
            ))}
          </select>
        )}
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Location type</span>
        <select
          name="locationType"
          defaultValue={String(initialValues.locationType ?? "domestic")}
          className="w-full rounded border px-3 py-2"
        >
          <option value="domestic">Domestic</option>
          <option value="international">International</option>
        </select>
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Workplace</span>
        <select
          name="workplaceType"
          defaultValue={String(initialValues.workplaceType ?? "onsite")}
          className="w-full rounded border px-3 py-2"
        >
          <option value="onsite">Onsite</option>
          <option value="hybrid">Hybrid</option>
          <option value="remote">Remote</option>
        </select>
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Location</span>
        <input
          name="location"
          defaultValue={String(initialValues.location ?? "")}
          className="w-full rounded border px-3 py-2"
        />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Country</span>
        <input
          name="country"
          defaultValue={String(initialValues.country ?? "India")}
          className="w-full rounded border px-3 py-2"
        />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Employment type</span>
        <select
          name="employmentType"
          defaultValue={String(initialValues.employmentType ?? "full_time")}
          className="w-full rounded border px-3 py-2"
        >
          <option value="full_time">Full time</option>
          <option value="part_time">Part time</option>
          <option value="contract">Contract</option>
          <option value="internship">Internship</option>
        </select>
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Openings</span>
        <input
          name="openings"
          type="number"
          min="1"
          defaultValue={Number(initialValues.openings ?? 1)}
          className="w-full rounded border px-3 py-2"
        />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">
          Min experience (months)
        </span>
        <input
          name="experienceMinMonths"
          type="number"
          min="0"
          defaultValue={Number(initialValues.experienceMinMonths ?? 0)}
          className="w-full rounded border px-3 py-2"
        />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">
          Max experience (months)
        </span>
        <input
          name="experienceMaxMonths"
          type="number"
          min="0"
          defaultValue={initialValues.experienceMaxMonths ?? ""}
          className="w-full rounded border px-3 py-2"
        />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Min salary</span>
        <input
          name="salaryMin"
          type="number"
          min="0"
          step="0.01"
          defaultValue={initialValues.salaryMin ?? ""}
          className="w-full rounded border px-3 py-2"
        />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Max salary</span>
        <input
          name="salaryMax"
          type="number"
          min="0"
          step="0.01"
          defaultValue={initialValues.salaryMax ?? ""}
          className="w-full rounded border px-3 py-2"
        />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">Currency</span>
        <input
          name="salaryCurrency"
          defaultValue={String(initialValues.salaryCurrency ?? "INR")}
          className="w-full rounded border px-3 py-2"
        />
      </label>
      <label>
        <span className="mb-1 block text-sm font-medium">
          Application deadline
        </span>
        <input
          name="applicationDeadline"
          type="date"
          defaultValue={String(initialValues.applicationDeadline ?? "").slice(0, 10)}
          className="w-full rounded border px-3 py-2"
        />
      </label>
      <label className="md:col-span-2">
        <span className="mb-1 block text-sm font-medium">Job description</span>
        <textarea
          name="jdText"
          required
          minLength={50}
          rows={12}
          defaultValue={String(initialValues.jdText ?? "")}
          className="w-full rounded border px-3 py-2"
        />
      </label>
      {state.message && (
        <p
          className={`md:col-span-2 text-sm ${state.success ? "text-green-700" : "text-red-700"}`}
        >
          {state.message}
        </p>
      )}
      <div className="md:col-span-2">
        <button
          disabled={pending}
          className="rounded bg-slate-950 px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save draft"}
        </button>
      </div>
    </form>
  );
}
