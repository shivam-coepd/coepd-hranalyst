import Link from "next/link";

import { requireUser } from "@/lib/auth/guards";

import { getNotifications } from "@/repositories/notifications.repository";

export default async function NotificationsPage() {
  const user = await requireUser();

  const notifications = await getNotifications(user.id, 100);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>

        <p className="mt-1 text-sm text-gray-500">
          Placement and interview updates.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`border-b p-5 ${item.is_read ? "" : "bg-blue-50"}`}
          >
            <h2 className="font-semibold">{item.title}</h2>

            <p className="mt-1 text-sm text-gray-600">{item.message}</p>

            <p className="mt-2 text-xs text-gray-400">
              {new Date(item.created_at).toLocaleString("en-IN")}
            </p>

            {item.action_url && (
              <Link
                href={item.action_url}
                className="mt-3 inline-block text-sm font-medium underline"
              >
                View details
              </Link>
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No notifications.
          </div>
        )}
      </div>
    </div>
  );
}
