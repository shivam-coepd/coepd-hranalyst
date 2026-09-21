"use client";
import { useActionState } from "react";
import type { State } from "@/app/placement-hr/jobs/new/actions";
import { Button } from "@/components/ui/button";
import { 
  Building2, Briefcase, MapPin, Globe, 
  Users, Calendar, FileText, Banknote, Clock, Award
} from "lucide-react";

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

  const inputClass = "w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm ring-offset-background transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  const selectClass = "w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm ring-offset-background transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer appearance-none";

  return (
    <form action={formAction} className="mt-8 space-y-8">
      
      {/* 1. Basic Details */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground tracking-tight">
          <Briefcase className="h-5 w-5 text-primary" />
          Basic Details
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Company</span>
            {lockedCompanyId ? (
              <>
                <input
                  type="text"
                  readOnly
                  disabled
                  className="w-full rounded-lg border border-input bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground"
                  value={companies.find((c) => c.id === lockedCompanyId)?.name || ""}
                />
                <input type="hidden" name="companyId" value={lockedCompanyId} />
              </>
            ) : (
              <div className="relative">
                <select
                  name="companyId"
                  defaultValue={String(initialValues.companyId ?? "")}
                  className={selectClass}
                >
                  <option value="" disabled>Select a company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Job Title</span>
            <input
              name="jobTitle"
              defaultValue={String(initialValues.jobTitle ?? "")}
              required
              placeholder="e.g. Senior Frontend Developer"
              className={inputClass}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Role Type</span>
            <div className="relative">
              <select
                name="roleType"
                defaultValue={String(initialValues.roleType ?? "BA")}
                className={selectClass}
              >
                {["BA", "PO", "PM", "SM"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Placement HR</span>
            {lockedPlacementHrId ? (
              <>
                <input
                  type="text"
                  readOnly
                  disabled
                  className="w-full rounded-lg border border-input bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground"
                  value={
                    placementHrs
                      .filter((h) => h.id === lockedPlacementHrId)
                      .map((h) => [h.first_name, h.last_name].filter(Boolean).join(" ") || h.email)[0] || ""
                  }
                />
                <input type="hidden" name="assignedPlacementHr" value={lockedPlacementHrId} />
              </>
            ) : (
              <div className="relative">
                <select
                  name="assignedPlacementHr"
                  defaultValue={String(initialValues.assignedPlacementHr ?? "")}
                  className={selectClass}
                >
                  <option value="">Unassigned</option>
                  {placementHrs.map((h) => (
                    <option key={h.id} value={h.id}>
                      {[h.first_name, h.last_name].filter(Boolean).join(" ") || h.email}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* 2. Location & Employment */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground tracking-tight">
          <MapPin className="h-5 w-5 text-primary" />
          Location & Logistics
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Location Type</span>
            <select name="locationType" defaultValue={String(initialValues.locationType ?? "domestic")} className={selectClass}>
              <option value="domestic">Domestic</option>
              <option value="international">International</option>
            </select>
          </label>
          
          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Workplace</span>
            <select name="workplaceType" defaultValue={String(initialValues.workplaceType ?? "onsite")} className={selectClass}>
              <option value="onsite">Onsite</option>
              <option value="hybrid">Hybrid</option>
              <option value="remote">Remote</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-foreground">Employment Type</span>
            <select name="employmentType" defaultValue={String(initialValues.employmentType ?? "full_time")} className={selectClass}>
              <option value="full_time">Full time</option>
              <option value="part_time">Part time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </label>

          <label className="space-y-2 lg:col-span-1">
            <span className="text-sm font-medium text-foreground">City / Region</span>
            <div className="relative">
              <input
                name="location"
                defaultValue={String(initialValues.location ?? "")}
                placeholder="e.g. Pune"
                className={inputClass}
              />
              <MapPin className="absolute right-4 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </label>

          <label className="space-y-2 lg:col-span-1">
            <span className="text-sm font-medium text-foreground">Country</span>
            <div className="relative">
              <input
                name="country"
                defaultValue={String(initialValues.country ?? "India")}
                className={inputClass}
              />
              <Globe className="absolute right-4 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </label>
          
          <label className="space-y-2 lg:col-span-1">
            <span className="text-sm font-medium text-foreground">Number of Openings</span>
            <div className="relative">
              <input
                name="openings"
                type="number"
                min="1"
                defaultValue={Number(initialValues.openings ?? 1)}
                className={inputClass}
              />
              <Users className="absolute right-4 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </label>
        </div>
      </div>

      {/* 3. Requirements & Compensation */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground tracking-tight">
          <Award className="h-5 w-5 text-primary" />
          Requirements & Compensation
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Experience */}
          <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Experience Required (Years)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-xs text-muted-foreground">Minimum</span>
                <input
                  name="experienceMinYears"
                  type="number"
                  min="0"
                  placeholder="0"
                  defaultValue={initialValues.experienceMinYears ?? ""}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs text-muted-foreground">Maximum</span>
                <input
                  name="experienceMaxYears"
                  type="number"
                  min="0"
                  placeholder="e.g. 60"
                  defaultValue={initialValues.experienceMaxYears ?? ""}
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          {/* Salary */}
          <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <h3 className="flex items-center justify-between text-sm font-medium text-foreground">
              <span className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-muted-foreground" />
                Salary Range
              </span>
              <label className="flex items-center gap-2 text-xs">
                Currency
                <input
                  name="salaryCurrency"
                  defaultValue={String(initialValues.salaryCurrency ?? "INR")}
                  className="w-16 rounded border border-input bg-background px-2 py-1 text-center font-medium"
                />
              </label>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-xs text-muted-foreground">Minimum</span>
                <input
                  name="salaryMin"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 500000"
                  defaultValue={initialValues.salaryMin ?? ""}
                  className={inputClass}
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs text-muted-foreground">Maximum</span>
                <input
                  name="salaryMax"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 1000000"
                  defaultValue={initialValues.salaryMax ?? ""}
                  className={inputClass}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Description & Deadlines */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-foreground tracking-tight">
          <FileText className="h-5 w-5 text-primary" />
          Job Description
        </h2>
        
        <div className="space-y-6">
          <label className="block space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Detailed Description</span>
              <span className="text-xs text-muted-foreground">Minimum 50 characters</span>
            </div>
            <textarea
              name="jdText"
              required
              minLength={50}
              rows={10}
              placeholder="Describe the role, responsibilities, and expectations..."
              defaultValue={String(initialValues.jdText ?? "")}
              className={`${inputClass} resize-y font-mono text-sm leading-relaxed`}
            />
          </label>

          <label className="block w-full max-w-sm space-y-2">
            <span className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Application Deadline
            </span>
            <input
              name="applicationDeadline"
              type="date"
              defaultValue={String(initialValues.applicationDeadline ?? "").slice(0, 10)}
              className={inputClass}
            />
          </label>
        </div>
      </div>

      {state.message && (
        <div className={`rounded-lg p-4 text-sm font-medium ${state.success ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {state.message}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={pending}
          variant="create"
          size="lg"
          className="min-w-[150px] shadow-md transition-transform active:scale-95"
        >
          {pending ? "Saving..." : "Save draft"}
        </Button>
      </div>
    </form>
  );
}
