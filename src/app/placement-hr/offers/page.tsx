import Link from "next/link";
import { requireRole } from "@/lib/auth/guards";
import { getTeamOffers } from "@/repositories/offers.repository";

export default async function PlacementOffersPage() {
  const user = await requireRole(["placement_hr", "admin", "super_admin"]);
  const isAdmin =
    user.roles.includes("admin") || user.roles.includes("super_admin");
  const offers = await getTeamOffers(user.id, isAdmin);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Offers</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track official offers, student decisions and placement readiness.
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">Candidate</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Designation</th>
              <th className="px-4 py-3">CTC</th>
              <th className="px-4 py-3">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => {
              const student = Array.isArray(offer.student_profiles)
                ? offer.student_profiles[0]
                : offer.student_profiles;
              const company = Array.isArray(offer.companies)
                ? offer.companies[0]
                : offer.companies;
              return (
                <tr key={offer.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    {[student?.first_name, student?.last_name]
                      .filter(Boolean)
                      .join(" ") || "Candidate"}
                  </td>
                  <td className="px-4 py-3">{company?.name ?? "—"}</td>
                  <td className="px-4 py-3">{offer.designation}</td>
                  <td className="px-4 py-3">
                    {offer.annual_ctc != null
                      ? `${offer.currency} ${Number(offer.annual_ctc).toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 capitalize">{offer.status}</td>
                  <td className="px-4 py-3">
                    <Link
                      className="font-medium underline"
                      href={`/placement-hr/offers/${offer.id}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {offers.length === 0 && (
          <div className="p-10 text-center text-gray-500">No offers found.</div>
        )}
      </div>
    </div>
  );
}
