"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";

export function NavLink({
  href,
  children,
  icon,
  exact = false,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href) && href !== '/';

  // special case for home link if it's not exact
  const finalIsActive = exact ? isActive : (href === '/' ? pathname === '/' : isActive);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        finalIsActive
          ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
