"use client";

import { useEffect, useState } from "react";

import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const roleBase = pathname.split("/")[1];
  const notificationsLink = roleBase ? `/${roleBase}/notifications` : "/notifications";

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
        className="-m-2.5 relative p-2.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="sr-only">View notifications</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        {unread > 0 && (
          <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-white dark:ring-slate-900">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-xl border bg-white shadow-lg shadow-black/5 dark:bg-slate-950 dark:border-slate-800">
          <div className="border-b border-slate-100 bg-slate-50/50 p-4 py-3 font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200">
            Notifications
          </div>

          <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {items.slice(0, 10).map((item) => (
              <div
                key={item.id}
                className={`relative p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 ${
                  item.is_read ? "bg-white dark:bg-slate-950" : "bg-primary/5 dark:bg-indigo-950/20"
                }`}
              >
                {!item.is_read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                )}
                <p className={`text-sm font-semibold tracking-tight ${item.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}`}>
                  {item.title}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {item.message}
                </p>

                <div className="mt-2 flex gap-3 text-xs">
                  {item.action_url && (
                    <Link
                      href={item.action_url}
                      onClick={() => markRead(item.id)}
                      className="font-medium text-primary hover:underline"
                    >
                      View details
                    </Link>
                  )}

                  {!item.is_read && (
                    <button
                      type="button"
                      onClick={() => markRead(item.id)}
                      className="font-medium text-muted-foreground hover:text-foreground"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 h-8 w-8 text-slate-300 dark:text-slate-700"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                No new notifications
              </div>
            )}
          </div>

          <Link
            href={notificationsLink}
            className="block border-t p-3 text-center text-sm font-medium"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
