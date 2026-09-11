import Link from "next/link";

import {
  requireActiveClientHr,
} from "@/services/client/client-profile.service";

import {
  getClientInterviews,
} from "@/repositories/interviews.repository";

export default async function
ClientInterviewsPage() {

  const {
    clientProfile,
  } =
    await requireActiveClientHr();

  const interviews =
    await getClientInterviews(
      clientProfile.company_id
    );

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">

      <div>
        <h1 className="text-2xl font-bold">
          Interviews
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Track upcoming and completed candidate interviews.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">

        <table className="w-full text-left text-sm">

          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">
                Candidate
              </th>
              <th className="px-4 py-3">
                Job
              </th>
              <th className="px-4 py-3">
                Round
              </th>
              <th className="px-4 py-3">
                Date
              </th>
              <th className="px-4 py-3">
                Mode
              </th>
              <th className="px-4 py-3">
                Status
              </th>
              <th className="px-4 py-3">
              </th>
            </tr>
          </thead>

          <tbody>

            {interviews.map(
              interview => {

                const candidate =
                  Array.isArray(
                    interview
                      .submission_candidates
                  )
                    ? interview
                        .submission_candidates[0]
                    : interview
                        .submission_candidates;

                const snapshot =
                  candidate
                    ?.candidate_snapshot as
                    Record<
                      string,
                      unknown
                    >
                    | undefined;

                const job =
                  Array.isArray(
                    interview.jobs
                  )
                    ? interview
                        .jobs[0]
                    : interview.jobs;

                return (
                  <tr
                    key={
                      interview.id
                    }
                    className="border-t"
                  >
                    <td className="px-4 py-3 font-medium">
                      {String(
                        snapshot
                          ?.candidate_name ??
                        "Candidate"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {
                        job
                          ?.job_title ??
                        "—"
                      }
                    </td>

                    <td className="px-4 py-3">
                      {
                        interview
                          .round_name
                      }
                    </td>

                    <td className="px-4 py-3">
                      {new Date(
                        interview
                          .scheduled_at
                      ).toLocaleString()}
                    </td>

                    <td className="px-4 py-3 capitalize">
                      {
                        interview.mode
                      }
                    </td>

                    <td className="px-4 py-3 capitalize">
                      {
                        interview.status
                      }
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        href={
                          `/client/interviews/${interview.id}`
                        }
                        className="font-medium underline"
                      >
                        View
                      </Link>
                    </td>

                  </tr>
                );
              }
            )}

            {interviews.length ===
              0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  No interviews scheduled.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}