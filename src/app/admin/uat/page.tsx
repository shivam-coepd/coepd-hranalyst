import Link from "next/link";

import {
  requireAdmin,
} from "@/lib/auth/guards";

import {
  getUatRuns,
} from "@/repositories/uat.repository";


export default async function
UatRunsPage() {

  await requireAdmin();


  const runs =
    await getUatRuns();


  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">

      <div>
        <h1 className="text-2xl font-bold">
          UAT Runs
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Final release validation across all HRAnalyst placement workflows.
        </p>
      </div>


      <div className="overflow-hidden rounded-xl border bg-white">

        <table className="w-full text-left text-sm">

          <thead className="bg-gray-50">

            <tr>
              <th className="px-4 py-3">
                Run
              </th>

              <th className="px-4 py-3">
                Release
              </th>

              <th className="px-4 py-3">
                Passed
              </th>

              <th className="px-4 py-3">
                Failed
              </th>

              <th className="px-4 py-3">
                Status
              </th>

              <th className="px-4 py-3">
              </th>
            </tr>

          </thead>


          <tbody>

            {runs.map(
              run => (

                <tr
                  key={
                    run.id
                  }
                  className="border-t"
                >

                  <td className="px-4 py-3 font-medium">
                    {
                      run.run_code
                    }
                  </td>

                  <td className="px-4 py-3">
                    {
                      run.release_version
                    }
                  </td>

                  <td className="px-4 py-3">
                    {
                      run.passed_tests
                    }
                    /
                    {
                      run.total_tests
                    }
                  </td>

                  <td className="px-4 py-3">
                    {
                      run.failed_tests
                    }
                  </td>

                  <td className="px-4 py-3 capitalize">
                    {
                      run.status
                    }
                  </td>

                  <td className="px-4 py-3">
                    <Link
                      href={
                        `/admin/uat/${run.id}`
                      }
                      className="font-medium underline"
                    >
                      Open
                    </Link>
                  </td>

                </tr>
              )
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}