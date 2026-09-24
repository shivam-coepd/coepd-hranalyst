import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Building2, MapPin, Globe, Users, FileText,
  Briefcase, Banknote, Clock, Award
} from "lucide-react";
import { format } from "date-fns";

export default function JobDetailsView({ 
  job,
  actions
}: { 
  job: any;
  actions?: React.ReactNode;
}) {
  let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
  if (job.status === "published") statusVariant = "success";
  if (job.status === "draft") statusVariant = "secondary";
  if (job.status === "pending_checklist") statusVariant = "pending";
  if (job.status === "closed") statusVariant = "destructive";

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {job.job_title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Badge variant={statusVariant} className="capitalize">
              {(job.status || "Unknown").replace('_', ' ')}
            </Badge>
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {job.job_code}
            </span>
            {job.companies?.name && (
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {job.companies.name}
              </span>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex shrink-0 items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-4 flex items-start gap-4 shadow-sm border-slate-200/60 bg-slate-50/50">
          <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Role Type</p>
            <p className="mt-1 font-semibold text-foreground">{job.role_type}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-start gap-4 shadow-sm border-slate-200/60 bg-slate-50/50">
          <div className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Location</p>
            <p className="mt-1 font-semibold text-foreground">
              {job.location ?? "Not specified"}
              {job.country ? `, ${job.country}` : ""}
              <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] uppercase text-slate-700">
                {job.location_type}
              </span>
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-start gap-4 shadow-sm border-slate-200/60 bg-slate-50/50">
          <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
            <Banknote className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Salary Range</p>
            <p className="mt-1 font-semibold text-foreground">
              {job.salary_min || job.salary_max ? (
                <>
                  {job.salary_currency} {job.salary_min ?? 0}
                  {job.salary_max ? ` - ${job.salary_max}` : "+"}
                </>
              ) : (
                "Not Disclosed"
              )}
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-start gap-4 shadow-sm border-slate-200/60 bg-slate-50/50">
          <div className="rounded-lg bg-amber-100 p-2 text-amber-700">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Experience</p>
            <p className="mt-1 font-semibold text-foreground">
              {job.experience_min_years ?? 0} {job.experience_max_years ? `- ${job.experience_max_years}` : "+"} Years
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 shadow-sm">
            <h3 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Job Description
            </h3>
            <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {job.jd_text}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 shadow-sm space-y-4">
            <h3 className="font-semibold tracking-tight text-foreground">Job Overview</h3>

            <div className="flex justify-between text-sm py-2 border-b">
              <span className="text-muted-foreground">Workplace Type</span>
              <span className="font-medium capitalize">{job.workplace_type}</span>
            </div>

            <div className="flex justify-between text-sm py-2 border-b">
              <span className="text-muted-foreground">Employment Type</span>
              <span className="font-medium capitalize">{(job.employment_type || "").replace('_', ' ')}</span>
            </div>

            <div className="flex justify-between text-sm py-2 border-b">
              <span className="text-muted-foreground">Openings</span>
              <span className="font-medium flex items-center gap-1">
                <Users className="h-3 w-3" />
                {job.openings}
              </span>
            </div>

            <div className="flex justify-between text-sm py-2 border-b">
              <span className="text-muted-foreground">Applicants</span>
              <span className="font-medium flex items-center gap-1">
                <Users className="h-3 w-3" />
                {job.candidates_count ?? 0}
              </span>
            </div>

            <div className="flex justify-between text-sm py-2 border-b">
              <span className="text-muted-foreground">Deadline</span>
              <span className="font-medium">
                {job.application_deadline
                  ? format(new Date(job.application_deadline), "MMM d, yyyy")
                  : "Until filled"}
              </span>
            </div>
          </Card>

          <Card className="p-6 shadow-sm space-y-4">
            <h3 className="font-semibold tracking-tight text-foreground">Administrative</h3>

            <div className="text-sm space-y-1 py-1 border-b">
              <span className="text-muted-foreground block text-xs uppercase tracking-wider">Created</span>
              <span className="font-medium flex justify-between">
                {format(new Date(job.created_at), "MMM d, yyyy")}
                {job.creator && (
                  <span className="text-slate-500">by {job.creator.first_name || 'User'}</span>
                )}
              </span>
            </div>

            <div className="text-sm space-y-1 py-1 border-b">
              <span className="text-muted-foreground block text-xs uppercase tracking-wider">Placement HR</span>
              <span className="font-medium">
                {job.placement_hr
                  ? `${job.placement_hr.first_name || ''} ${job.placement_hr.last_name || ''}`.trim() || job.placement_hr.email
                  : "Unassigned"}
              </span>
            </div>

            {job.published_at && (
              <div className="text-sm space-y-1 py-1">
                <span className="text-muted-foreground block text-xs uppercase tracking-wider">Published</span>
                <span className="font-medium">{format(new Date(job.published_at), "MMM d, yyyy")}</span>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
