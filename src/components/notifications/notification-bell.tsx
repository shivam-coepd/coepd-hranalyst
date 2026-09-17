"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
};

export function NotificationBell() {
  const [items, setItems] = useState<NotificationItem[]>([]);

  const [unread, setUnread] = useState(0);

  const [open, setOpen] = useState(false);

  async function load() {
    const response = await fetch("/api/notifications");

    if (!response.ok) {
      return;
    }

    const result = await response.json();

    setItems(result.notifications ?? []);

    setUnread(result.unreadCount ?? 0);
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);

    const interval = window.setInterval(load, 30_000);

    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, {
      method: "POST",
    });

    await load();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-md border px-3 py-2"
      >
        Notifications
        {unread > 0 && (
          <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-96 max-w-[90vw] overflow-hidden rounded-xl border bg-white shadow-xl">
          <div className="border-b p-4 font-semibold">Notifications</div>

          <div className="max-h-96 overflow-y-auto">
            {items.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className={`border-b p-4 ${
                  item.is_read ? "bg-white" : "bg-blue-50"
                }`}
              >
                <p className="text-sm font-semibold">{item.title}</p>

                <p className="mt-1 text-sm text-gray-600">{item.message}</p>

                <div className="mt-3 flex gap-3 text-xs">
                  {item.action_url && (
                    <Link
                      href={item.action_url}
                      onClick={() => markRead(item.id)}
                      className="font-medium underline"
                    >
                      View
                    </Link>
                  )}

                  {!item.is_read && (
                    <button
                      type="button"
                      onClick={() => markRead(item.id)}
                      className="underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500">
                No notifications.
              </div>
            )}
          </div>

          <Link
            href="/notifications"
            className="block border-t p-3 text-center text-sm font-medium"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
