"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Bell, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

type Notification = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
};

export default function LiveNotifications({
  userId,
  initialNotifications,
}: {
  userId: string;
  initialNotifications: Notification[];
}) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to new notifications
    const channel = supabase
      .channel(`notifications:user_id=eq.${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  // Mark all as read when component mounts (or could be manual)
  useEffect(() => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length > 0) {
      supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in("id", unreadIds)
        .then(() => {
          setNotifications((prev) =>
            prev.map((n) => (unreadIds.includes(n.id) ? { ...n, is_read: true } : n))
          );
        });
    }
  }, [notifications, supabase]);

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-950 dark:border-slate-800 w-full max-w-4xl">
      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 mb-4">
            <Bell className="h-6 w-6" />
          </div>
          <p>No notifications.</p>
        </div>
      )}

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`p-6 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 ${
              item.is_read ? "" : "bg-primary/5/50 dark:bg-indigo-950/20 relative"
            }`}
          >
            {!item.is_read && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
            )}
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    item.is_read
                      ? "bg-slate-100 text-slate-500 dark:bg-slate-800"
                      : "bg-primary/10 text-primary dark:bg-indigo-900"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h2
                    className={`font-semibold tracking-tight ${
                      item.is_read ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-slate-100"
                    }`}
                  >
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.message}
                  </p>
                  {item.action_url && (
                    <Link
                      href={item.action_url}
                      className={buttonVariants({ variant: "link", className: "mt-2 px-0 h-auto" })}
                    >
                      View details <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {new Date(item.created_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
