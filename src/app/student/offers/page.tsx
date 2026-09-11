import Link from "next/link";

import {
  requireRole,
} from "@/lib/auth/guards";

import {
  supabaseAdmin,
} from "@/lib/supabase/admin";

import {
  getStudentOffers,
} from "@/repositories/offers.repository";

export default async function
StudentOffersPage() {

  const user =
    await requireRole([
      "student",
    ]);

  const {
    data:
      studentProfile,
    error,
  } =
    await supabaseAdmin
      .from(
        "student_profiles"
      )
      .select("id")
      .eq(
        "user_id",
        user.id
      )
      .single();

  if (
    error ||
    !studentProfile
  ) {
    throw new Error(
      "Student profile not found"
    );
  }

  const offers =
    await getStudentOffers(
      studentProfile.id
    );

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">

      <div>
        <h1 className="text-2xl font-bold">
          My Offers
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Review your official placement offers.
        </p>
      </div>

      <div className="grid gap-4">

        {offers.map(
          offer => {

            const company =
              Array.isArray(
                offer.companies
              )
                ? offer
                    .companies[0]
                : offer.companies;

            const job =
              Array.isArray(
                offer.jobs
              )
                ? offer.jobs[0]
                : offer.jobs;

            return (
              <Link
                key={offer.id}
                href={
                  `/student/offers/${offer.id}`
                }
                className="rounded-xl border bg-white p-5 transition hover:shadow-sm"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-sm text-gray-500">
                      {
                        company?.name
                      }
                    </p>

                    <h2 className="mt-1 text-lg font-semibold">
                      {
                        offer.designation
                      }
                    </h2>

                    <p className="mt-1 text-sm">
                      {
                        job?.job_title
                      }
                    </p>

                  </div>

                  <span className="rounded-full border px-3 py-1 text-xs capitalize">
                    {
                      offer.status
                    }
                  </span>

                </div>

                {offer.annual_ctc !==
                  null && (
                  <p className="mt-4 text-sm">
                    CTC:{" "}
                    <strong>
                      {
                        offer.currency
                      }{" "}
                      {
                        Number(
                          offer.annual_ctc
                        ).toLocaleString()
                      }
                    </strong>
                  </p>
                )}

              </Link>
            );
          }
        )}

        {offers.length ===
          0 && (
          <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
            No offers available.
          </div>
        )}

      </div>

    </div>
  );
}