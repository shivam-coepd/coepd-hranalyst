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
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
