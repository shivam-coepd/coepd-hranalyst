"use client";
import { useActionState } from "react";
type State={success:boolean;message:string};
type Company={id:string;name:string}; type Hr={id:string;first_name:string|null;last_name:string|null;email:string};
export default function JobForm({action,companies,placementHrs,lockedCompanyId,defaults={}}:{action:(s:State,f:FormData)=>Promise<State>;companies:Company[];placementHrs:Hr[];lockedCompanyId?:string;defaults?:Record<string,string|number|null|undefined>}){
 const [state,formAction,pending]=useActionState(action,{success:false,message:""});
 return <form action={formAction} className="mt-6 grid gap-4 md:grid-cols-2">
  <label><span className="mb-1 block text-sm font-medium">Company</span><select name="companyId" defaultValue={lockedCompanyId??String(defaults.companyId??"")} disabled={!!lockedCompanyId} className="w-full rounded border px-3 py-2">{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>{lockedCompanyId&&<input type="hidden" name="companyId" value={lockedCompanyId}/>}</label>
  <label><span className="mb-1 block text-sm font-medium">Job title</span><input name="jobTitle" defaultValue={String(defaults.jobTitle??"")} required className="w-full rounded border px-3 py-2"/></label>
  <label><span className="mb-1 block text-sm font-medium">Role</span><select name="roleType" defaultValue={String(defaults.roleType??"BA")} className="w-full rounded border px-3 py-2">{["BA","PO","PM","SM"].map(v=><option key={v}>{v}</option>)}</select></label>
  <label><span className="mb-1 block text-sm font-medium">Placement HR</span><select name="assignedPlacementHr" defaultValue={String(defaults.assignedPlacementHr??"")} className="w-full rounded border px-3 py-2"><option value="">Unassigned</option>{placementHrs.map(h=><option key={h.id} value={h.id}>{[h.first_name,h.last_name].filter(Boolean).join(" ")||h.email}</option>)}</select></label>
  <label><span className="mb-1 block text-sm font-medium">Location type</span><select name="locationType" defaultValue={String(defaults.locationType??"domestic")} className="w-full rounded border px-3 py-2"><option value="domestic">Domestic</option><option value="international">International</option></select></label>
  <label><span className="mb-1 block text-sm font-medium">Workplace</span><select name="workplaceType" defaultValue={String(defaults.workplaceType??"onsite")} className="w-full rounded border px-3 py-2"><option value="onsite">Onsite</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option></select></label>
  <label><span className="mb-1 block text-sm font-medium">Location</span><input name="location" defaultValue={String(defaults.location??"")} className="w-full rounded border px-3 py-2"/></label>
  <label><span className="mb-1 block text-sm font-medium">Country</span><input name="country" defaultValue={String(defaults.country??"India")} className="w-full rounded border px-3 py-2"/></label>
  <label><span className="mb-1 block text-sm font-medium">Employment type</span><select name="employmentType" defaultValue={String(defaults.employmentType??"full_time")} className="w-full rounded border px-3 py-2"><option value="full_time">Full time</option><option value="part_time">Part time</option><option value="contract">Contract</option><option value="internship">Internship</option></select></label>
  <label><span className="mb-1 block text-sm font-medium">Openings</span><input name="openings" type="number" min="1" defaultValue={Number(defaults.openings??1)} className="w-full rounded border px-3 py-2"/></label>
  <label><span className="mb-1 block text-sm font-medium">Min experience (months)</span><input name="experienceMinMonths" type="number" min="0" defaultValue={Number(defaults.experienceMinMonths??0)} className="w-full rounded border px-3 py-2"/></label>
  <label><span className="mb-1 block text-sm font-medium">Max experience (months)</span><input name="experienceMaxMonths" type="number" min="0" defaultValue={defaults.experienceMaxMonths??""} className="w-full rounded border px-3 py-2"/></label>
  <label><span className="mb-1 block text-sm font-medium">Min salary</span><input name="salaryMin" type="number" min="0" step="0.01" defaultValue={defaults.salaryMin??""} className="w-full rounded border px-3 py-2"/></label>
  <label><span className="mb-1 block text-sm font-medium">Max salary</span><input name="salaryMax" type="number" min="0" step="0.01" defaultValue={defaults.salaryMax??""} className="w-full rounded border px-3 py-2"/></label>
  <label><span className="mb-1 block text-sm font-medium">Currency</span><input name="salaryCurrency" defaultValue={String(defaults.salaryCurrency??"INR")} className="w-full rounded border px-3 py-2"/></label>
  <label><span className="mb-1 block text-sm font-medium">Application deadline</span><input name="applicationDeadline" type="date" defaultValue={String(defaults.applicationDeadline??"").slice(0,10)} className="w-full rounded border px-3 py-2"/></label>
  <label className="md:col-span-2"><span className="mb-1 block text-sm font-medium">Job description</span><textarea name="jdText" required minLength={50} rows={12} defaultValue={String(defaults.jdText??"")} className="w-full rounded border px-3 py-2"/></label>
  {state.message&&<p className={`md:col-span-2 text-sm ${state.success?"text-green-700":"text-red-700"}`}>{state.message}</p>}
  <div className="md:col-span-2"><button disabled={pending} className="rounded bg-slate-950 px-4 py-2 text-white disabled:opacity-50">{pending?"Saving...":"Save draft"}</button></div>
 </form>;
}
