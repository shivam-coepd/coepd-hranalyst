"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Category =
  | "business_analysis"
  | "product"
  | "domain"
  | "technical"
  | "soft_skill"
  | "methodology"
  | "tool"
  | "other";
type MustHave = {
  skill: string;
  category: Category;
  importance: "mandatory" | "preferred";
  evidence_required: boolean;
};
type Good = { skill: string; category: Category };
type Tool = {
  name: string;
  required_level:
    "basic" | "working" | "intermediate" | "advanced" | "not_specified";
};
type Checklist = {
  id: string;
  status: string;
  version: number;
  source: string;
  must_have: MustHave[];
  good_to_have: Good[];
  tools: Tool[];
  domain: string;
  exp_required: string;
  top_3_skills: string[];
  checklist_summary: string | null;
};

const categories: Category[] = [
  "business_analysis",
  "product",
  "domain",
  "technical",
  "soft_skill",
  "methodology",
  "tool",
  "other",
];
const levels: Tool["required_level"][] = [
  "basic",
  "working",
  "intermediate",
  "advanced",
  "not_specified",
];

export default function ChecklistWorkflow({
  jobId,
  jobStatus,
  initialChecklist,
}: {
  jobId: string;
  jobStatus: string;
  initialChecklist: Checklist | null;
}) {
  const router = useRouter();
  const [checklist, setChecklist] = useState(initialChecklist);
  const [mustHave, setMustHave] = useState<MustHave[]>(
    initialChecklist?.must_have ?? [],
  );
  const [goodToHave, setGoodToHave] = useState<Good[]>(
    initialChecklist?.good_to_have ?? [],
  );
  const [tools, setTools] = useState<Tool[]>(initialChecklist?.tools ?? []);
  const [domain, setDomain] = useState(initialChecklist?.domain ?? "");
  const [expRequired, setExpRequired] = useState(
    initialChecklist?.exp_required ?? "",
  );
  const [top3, setTop3] = useState<string[]>(
    initialChecklist?.top_3_skills ?? [""],
  );
  const [summary, setSummary] = useState(
    initialChecklist?.checklist_summary ?? "",
  );
  const [email, setEmail] = useState(true);
  const [whatsapp, setWhatsapp] = useState(false);
  const [telegram, setTelegram] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const editable = checklist?.status === "draft";
  const canPublish =
    jobStatus === "pending_checklist" && checklist?.status === "approved";
  const payload = useMemo(
    () => ({
      mustHave,
      goodToHave,
      tools,
      domain,
      expRequired,
      top3Skills: top3.filter(Boolean).slice(0, 3),
      checklistSummary: summary,
    }),
    [mustHave, goodToHave, tools, domain, expRequired, top3, summary],
  );

  async function call(url: string, method = "POST", body?: unknown) {
    setBusy(url);
    setMessage("");
    try {
      const r = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? "Request failed");
      return j;
    } finally {
      setBusy("");
    }
  }
  async function generate() {
    try {
      const j = await call(`/api/jobs/${jobId}/checklist/generate`);
      setChecklist(j.data);
      setMustHave(j.data.must_have ?? []);
      setGoodToHave(j.data.good_to_have ?? []);
      setTools(j.data.tools ?? []);
      setDomain(j.data.domain ?? "");
      setExpRequired(j.data.exp_required ?? "");
      setTop3(j.data.top_3_skills ?? [""]);
      setSummary(j.data.checklist_summary ?? "");
      setMessage("AI checklist generated. Review it before approval.");
      router.refresh();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Unable to generate checklist",
      );
    }
  }
  async function save() {
    if (!checklist) return;
    try {
      const j = await call(`/api/checklists/${checklist.id}`, "PATCH", payload);
      setChecklist(j.data);
      setMessage("Checklist saved.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to save checklist");
    }
  }
  async function approve() {
    if (!checklist) return;
    if (
      !confirm(
        "Approve this checklist? Approved criteria will be used for job screening.",
      )
    )
      return;
    try {
      await save();
      await call(`/api/checklists/${checklist.id}/approve`);
      setChecklist({ ...checklist, status: "approved" });
      setMessage("Checklist approved. The job can now be published.");
      router.refresh();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Unable to approve checklist",
      );
    }
  }
  async function publish() {
    if (!confirm("Publish this job to students?")) return;
    try {
      await call(`/api/jobs/${jobId}/publish`, "POST", {
        email,
        whatsapp,
        telegram,
      });
      setMessage("Job published and student broadcasts queued.");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Unable to publish job");
    }
  }

  const input = "rounded border border-slate-300 px-3 py-2 text-sm";
  return (
    <section className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Screening checklist</h2>
          <p className="text-sm text-slate-600">
            AI generates the draft; Placement HR/Admin reviews and approves it
            before publishing.
          </p>
        </div>
        {jobStatus === "pending_checklist" && (
          <button
            onClick={generate}
            disabled={!!busy}
            className="rounded bg-indigo-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {busy.includes("generate")
              ? "Generating…"
              : checklist
                ? "Regenerate AI draft"
                : "Generate AI checklist"}
          </button>
        )}
      </div>
      {!checklist ? (
        <p className="mt-6 rounded bg-slate-50 p-4 text-sm text-slate-600">
          No checklist has been generated yet.
        </p>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="text-sm text-slate-600">
            Version {checklist.version} · {checklist.status} ·{" "}
            {checklist.source}
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium">Must-have requirements</h3>
              {editable && (
                <button
                  className="text-sm text-primary"
                  onClick={() =>
                    setMustHave((v) => [
                      ...v,
                      {
                        skill: "",
                        category: "business_analysis",
                        importance: "mandatory",
                        evidence_required: true,
                      },
                    ])
                  }
                >
                  + Add
                </button>
              )}
            </div>
            <div className="space-y-2">
              {mustHave.map((m, i) => (
                <div
                  key={i}
                  className="grid gap-2 md:grid-cols-[1fr_180px_150px_100px_auto]"
                >
                  <input
                    disabled={!editable}
                    className={input}
                    value={m.skill}
                    onChange={(e) =>
                      setMustHave((v) =>
                        v.map((x, n) =>
                          n === i ? { ...x, skill: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="Requirement"
                  />
                  <select
                    disabled={!editable}
                    className={input}
                    value={m.category}
                    onChange={(e) =>
                      setMustHave((v) =>
                        v.map((x, n) =>
                          n === i
                            ? { ...x, category: e.target.value as Category }
                            : x,
                        ),
                      )
                    }
                  >
                    {categories.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                  <select
                    disabled={!editable}
                    className={input}
                    value={m.importance}
                    onChange={(e) =>
                      setMustHave((v) =>
                        v.map((x, n) =>
                          n === i
                            ? {
                                ...x,
                                importance: e.target
                                  .value as MustHave["importance"],
                              }
                            : x,
                        ),
                      )
                    }
                  >
                    <option value="mandatory">mandatory</option>
                    <option value="preferred">preferred</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      disabled={!editable}
                      type="checkbox"
                      checked={m.evidence_required}
                      onChange={(e) =>
                        setMustHave((v) =>
                          v.map((x, n) =>
                            n === i
                              ? { ...x, evidence_required: e.target.checked }
                              : x,
                          ),
                        )
                      }
                    />
                    Evidence
                  </label>
                  {editable && (
                    <button
                      className="text-sm text-red-700"
                      onClick={() =>
                        setMustHave((v) => v.filter((_, n) => n !== i))
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium">Good-to-have</h3>
              {editable && (
                <button
                  className="text-sm text-primary"
                  onClick={() =>
                    setGoodToHave((v) => [
                      ...v,
                      { skill: "", category: "other" },
                    ])
                  }
                >
                  + Add
                </button>
              )}
            </div>
            <div className="space-y-2">
              {goodToHave.map((m, i) => (
                <div
                  key={i}
                  className="grid gap-2 md:grid-cols-[1fr_200px_auto]"
                >
                  <input
                    disabled={!editable}
                    className={input}
                    value={m.skill}
                    onChange={(e) =>
                      setGoodToHave((v) =>
                        v.map((x, n) =>
                          n === i ? { ...x, skill: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <select
                    disabled={!editable}
                    className={input}
                    value={m.category}
                    onChange={(e) =>
                      setGoodToHave((v) =>
                        v.map((x, n) =>
                          n === i
                            ? { ...x, category: e.target.value as Category }
                            : x,
                        ),
                      )
                    }
                  >
                    {categories.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                  {editable && (
                    <button
                      className="text-sm text-red-700"
                      onClick={() =>
                        setGoodToHave((v) => v.filter((_, n) => n !== i))
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium">Tools</h3>
              {editable && (
                <button
                  className="text-sm text-primary"
                  onClick={() =>
                    setTools((v) => [
                      ...v,
                      { name: "", required_level: "not_specified" },
                    ])
                  }
                >
                  + Add
                </button>
              )}
            </div>
            <div className="space-y-2">
              {tools.map((t, i) => (
                <div
                  key={i}
                  className="grid gap-2 md:grid-cols-[1fr_220px_auto]"
                >
                  <input
                    disabled={!editable}
                    className={input}
                    value={t.name}
                    onChange={(e) =>
                      setTools((v) =>
                        v.map((x, n) =>
                          n === i ? { ...x, name: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <select
                    disabled={!editable}
                    className={input}
                    value={t.required_level}
                    onChange={(e) =>
                      setTools((v) =>
                        v.map((x, n) =>
                          n === i
                            ? {
                                ...x,
                                required_level: e.target
                                  .value as Tool["required_level"],
                              }
                            : x,
                        ),
                      )
                    }
                  >
                    {levels.map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                  {editable && (
                    <button
                      className="text-sm text-red-700"
                      onClick={() =>
                        setTools((v) => v.filter((_, n) => n !== i))
                      }
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-1 text-sm">
              Domain
              <input
                disabled={!editable}
                className={input}
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </label>
            <label className="grid gap-1 text-sm">
              Experience requirement
              <input
                disabled={!editable}
                className={input}
                value={expRequired}
                onChange={(e) => setExpRequired(e.target.value)}
              />
            </label>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Top 3 skills</h3>
            <div className="grid gap-2 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  disabled={!editable}
                  className={input}
                  value={top3[i] ?? ""}
                  onChange={(e) =>
                    setTop3((v) => {
                      const n = [...v];
                      n[i] = e.target.value;
                      return n;
                    })
                  }
                  placeholder={`Skill ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <label className="grid gap-1 text-sm">
            Checklist summary
            <textarea
              disabled={!editable}
              className={`${input} min-h-24`}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </label>
          {editable && (
            <div className="flex gap-3">
              <button
                onClick={save}
                disabled={!!busy}
                className="rounded border px-4 py-2 text-sm"
              >
                Save draft
              </button>
              <button
                onClick={approve}
                disabled={!!busy}
                className="rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white"
              >
                Save & approve
              </button>
            </div>
          )}
          {canPublish && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="font-medium">Publish & broadcast</h3>
              <div className="mt-3 flex flex-wrap gap-5 text-sm">
                <label>
                  <input type="checkbox" checked disabled /> In-app
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={email}
                    onChange={(e) => setEmail(e.target.checked)}
                  />{" "}
                  Email
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.checked)}
                  />{" "}
                  WhatsApp
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={telegram}
                    onChange={(e) => setTelegram(e.target.checked)}
                  />{" "}
                  Telegram channel
                </label>
              </div>
              <button
                onClick={publish}
                disabled={!!busy}
                className="mt-4 rounded bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                Publish job
              </button>
            </div>
          )}
        </div>
      )}
      {message && (
        <p className="mt-4 rounded bg-slate-100 p-3 text-sm">{message}</p>
      )}
    </section>
  );
}
