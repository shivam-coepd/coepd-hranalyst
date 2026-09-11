"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanyActions({ companyId, status, active }: { companyId: string; status: string; active: boolean }) {
  const router = useRouter(); const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  async function post(url:string, body?:unknown){ setBusy(true); setMessage(""); const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:body?JSON.stringify(body):undefined}); const j=await r.json().catch(()=>({})); setBusy(false); if(!r.ok){setMessage(j.error??"Request failed");return;} router.refresh(); }
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-2">
      {status !== "verified" && <button disabled={busy} onClick={()=>post(`/api/companies/${companyId}/verify`)} className="rounded bg-green-700 px-3 py-2 text-white">Verify</button>}
      {status !== "rejected" && <button disabled={busy} onClick={()=>{const reason=window.prompt("Rejection reason"); if(reason) post(`/api/companies/${companyId}/reject`,{reason});}} className="rounded bg-red-700 px-3 py-2 text-white">Reject</button>}
      <button disabled={busy} onClick={()=>post(`/api/companies/${companyId}/active`,{active:!active})} className="rounded border px-3 py-2">{active?"Deactivate":"Activate"}</button>
    </div>{message&&<p className="text-sm text-red-700">{message}</p>}
  </div>;
}
