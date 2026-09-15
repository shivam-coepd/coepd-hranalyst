"use client";

import { LogOut, Bell, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Topbar({
  user,
}: {
  user: { firstName: string | null; lastName: string | null; email?: string };
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const safeEmail = user.email || "";
  const displayName = user.firstName ? `${user.firstName} ${user.lastName || ""}` : safeEmail;
  const initials = user.firstName ? user.firstName.charAt(0) : safeEmail.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:bg-slate-950 dark:border-slate-800">
      <button type="button" className="-m-2.5 p-2.5 text-slate-700 lg:hidden dark:text-slate-300">
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Link href="/notifications" className="-m-2.5 p-2.5 text-slate-400 hover:text-slate-500">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </Link>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200 dark:bg-slate-700" aria-hidden="true" />

          <div className="flex items-center gap-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {initials}
            </div>
            <span className="hidden text-sm font-semibold leading-6 text-slate-900 lg:block dark:text-slate-100">
              {displayName}
            </span>
            <button
              onClick={handleSignOut}
              className="rounded-full p-2 text-slate-400 hover:text-slate-500"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
