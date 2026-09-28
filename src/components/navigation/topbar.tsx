"use client";

import { LogOut, Bell, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ChangePasswordModal from "@/components/auth/change-password-modal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { NavItem } from "./sidebar";
import { NavLink } from "./nav-link";

export function Topbar({
  user,
  navTitle,
  navItems,
}: {
  user: { firstName: string | null; lastName: string | null; email?: string };
  navTitle?: string;
  navItems?: NavItem[];
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
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-card sm:gap-x-6 sm:px-6 lg:px-8 dark:bg-primary dark:border-slate-800">
      {navItems && navItems.length > 0 ? (
        <Sheet>
          <SheetTrigger
            render={
              <button type="button" className="-m-2.5 p-2.5 text-foreground md:hidden dark:text-slate-300" />
            }
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 shrink-0 items-center border-b px-6">
              <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-lg">H</span>
                </div>
                HRAnalyst
              </Link>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              {navTitle && (
                <div className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {navTitle}
                </div>
              )}
              <nav className="grid gap-1 px-3">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    exact={item.exact}
                  >
                    {item.title}
                  </NavLink>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <button type="button" className="-m-2.5 p-2.5 text-foreground md:hidden dark:text-slate-300">
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <Link href="/notifications" className="-m-2.5 p-2.5 text-muted-foreground hover:text-muted-foreground">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </Link>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-muted dark:bg-primary" aria-hidden="true" />

          <div className="flex items-center gap-x-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground dark:bg-primary dark:text-slate-300">
              {initials}
            </div>
            <span className="hidden text-sm font-semibold leading-6 text-foreground lg:block dark:text-slate-100">
              {displayName}
            </span>
            <ChangePasswordModal />
            <button
              onClick={handleSignOut}
              className="rounded-full p-2 text-muted-foreground hover:text-muted-foreground"
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
