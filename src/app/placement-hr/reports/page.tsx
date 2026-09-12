import { requireRole } from "@/lib/auth/guards";

export default async function ReportsPage() {
  await requireRole(["placement_hr", "admin", "super_admin"]);

  const reports = [
    {
      title: "Applications Report",

      description: "Complete candidate application lifecycle.",

      href: "/api/reports/applications",
    },

    {
      title: "Placements Report",

      description: "Placed candidates, CTC and joining status.",

      href: "/api/reports/placements",
    },

    {
      title: "Feedback SLA Report",

      description: "24-hour feedback SLA and 48-hour escalation tracking.",

      href: "/api/reports/feedback-sla",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>

        <p className="mt-1 text-sm text-gray-500">
          Download operational placement reports.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {reports.map((report) => (
          <div key={report.href} className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold">{report.title}</h2>

            <p className="mt-2 text-sm text-gray-500">{report.description}</p>

            <a
              href={report.href}
              className="mt-5 inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Download CSV
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
