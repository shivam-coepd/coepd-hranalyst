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
      <form onSubmit={upload} className="rounded-xl border p-5">
        <h2 className="font-semibold">Upload CV</h2>
        <p className="mt-1 text-sm text-slate-600">
          PDF or DOCX, maximum 10 MB.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            required
            type="file"
            name="cv"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          />
          <button
            disabled={busy}
            className="rounded-lg bg-slate-950 px-4 py-2 text-white disabled:opacity-60"
          >
            Upload
          </button>
        </div>
      </form>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
      <div className="space-y-3">
        {cvs.length === 0 && (
          <div className="rounded-xl border p-5 text-sm text-slate-600">
            No CV uploaded yet.
          </div>
        )}
        {cvs.map((cv) => (
          <div
            key={cv.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"
          >
            <div>
              <div className="font-medium">{cv.original_file_name}</div>
              <div className="text-sm text-slate-500">
                {Math.ceil(cv.file_size / 1024)} KB · {cv.parsing_status}{" "}
                {cv.is_primary ? "· Primary" : ""}
              </div>
            </div>
            <div className="flex gap-2">
              <a
                className="rounded border px-3 py-2 text-sm"
                href={`/api/student/cvs/${cv.id}/download`}
                target="_blank"
              >
                Download
              </a>
              {!cv.is_primary && (
                <button
                  disabled={busy}
                  onClick={() => action(cv.id, "primary")}
                  className="rounded border px-3 py-2 text-sm"
                >
                  Set primary
                </button>
              )}
              <button
                disabled={busy}
                onClick={() => action(cv.id, "delete")}
                className="rounded border px-3 py-2 text-sm text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
