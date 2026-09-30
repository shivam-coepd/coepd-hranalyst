"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type CV = {
  id: string;
  original_file_name: string;
  file_size: number;
  is_primary: boolean;
  parsing_status: string;
  uploaded_at: string;
};
export default function CvManager({ initialCvs }: { initialCvs: CV[] }) {
  const [cvs] = useState(initialCvs);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget).get("cv") as File | null;
    if (!f) return;
    setBusy(true);
    setMsg("");
    const prep = await fetch("/api/student/cvs/upload-url", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fileName: f.name,
        fileSize: f.size,
        mimeType: f.type,
      }),
    });
    const p = await prep.json();
    if (!prep.ok) {
      setMsg(p.error);
      setBusy(false);
      return;
    }
    const uploadRes = await fetch(p.signedUrl, {
      method: "PUT",
      body: f,
      headers: {
        "Content-Type": f.type,
      },
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      console.error("S3 Upload Error:", uploadRes.status, uploadRes.statusText, errorText);
      setMsg(`Upload failed: ${uploadRes.status} ${uploadRes.statusText}. Please try again.`);
      setBusy(false);
      return;
    }
    const done = await fetch("/api/student/cvs/complete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        cvId: p.cvId,
        storagePath: p.storagePath,
        originalFileName: f.name,
        fileSize: f.size,
        mimeType: f.type,
      }),
    });
    const d = await done.json();
    if (!done.ok) {
      console.error("Complete Error:", d.error);
      setMsg(`Finalizing upload failed: ${d.error || 'Unknown Error'}`);
      setBusy(false);
      return;
    }
    location.reload();
  }
  async function action(id: string, kind: "primary" | "delete") {
    setBusy(true);
    const r = await fetch(
      `/api/student/cvs/${id}${kind === "primary" ? "/primary" : ""}`,
      { method: kind === "primary" ? "POST" : "DELETE" },
    );
    const j = await r.json();
    if (!r.ok) setMsg(j.error || "Action failed");
    else location.reload();
    setBusy(false);
  }
  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
        <h2 className="text-lg font-semibold tracking-tight">Upload New CV</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          PDF or DOCX, maximum 10 MB. Your uploaded resume will be parsed automatically.
        </p>
        <form onSubmit={upload} className="mt-4 flex flex-wrap items-center gap-4">
          <input
            required
            type="file"
            name="cv"
            className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium hover:bg-slate-50 dark:hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
          <button
            disabled={busy}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {busy ? "Uploading..." : "Upload CV"}
          </button>
        </form>
        {msg && <p className="mt-2 text-sm font-medium text-destructive">{msg}</p>}
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
          {cvs.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
              No CV uploaded yet.
            </div>
          )}
          {cvs.map((cv) => (
            <div
              key={cv.id}
              className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-text"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
                  </div>
                  {cv.is_primary && (
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
                      Primary
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground transition-colors line-clamp-2">
                  {cv.original_file_name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {Math.ceil(cv.file_size / 1024)} KB • <span className="capitalize">{cv.parsing_status}</span>
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                <a
                  className="inline-flex flex-1 items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  href={`/api/student/cvs/${cv.id}/download`}
                  target="_blank"
                >
                  Download
                </a>
                {!cv.is_primary && (
                  <button
                    disabled={busy}
                    onClick={() => action(cv.id, "primary")}
                    className="inline-flex flex-1 items-center justify-center rounded-md bg-secondary text-secondary-foreground px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-secondary/80 disabled:opacity-50"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  disabled={busy}
                  onClick={() => action(cv.id, "delete")}
                  className="inline-flex items-center justify-center rounded-md border border-destructive bg-background px-3 py-2 text-sm font-medium text-destructive shadow-sm transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
