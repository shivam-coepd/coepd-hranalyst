import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { getNotifications } from "@/repositories/notifications.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Bell, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await getNotifications(user.id, 100);

  return (
    <div className="p-8">
      <PageHeader 
        title="Notifications" 
        description="Placement and interview updates."
      />

      <div className="mt-8 overflow-hidden rounded-xl border bg-white shadow-sm dark:bg-slate-950 dark:border-slate-800 max-w-4xl">
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
                  <div className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.is_read ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' : 'bg-primary/10 text-primary dark:bg-indigo-900'}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className={`font-semibold tracking-tight ${item.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-slate-100'}`}>
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
    </div>
  );
}
