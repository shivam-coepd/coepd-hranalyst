import Link from "next/link";
import { NavLink } from "./nav-link";

export type NavItem = {
  title: string;
  href: string;
  icon?: React.ReactNode;
  exact?: boolean;
};

export function Sidebar({
  title,
  items,
}: {
  title: string;
  items: NavItem[];
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r bg-white dark:border-slate-800 dark:bg-slate-950 md:flex">
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <span className="text-lg">H</span>
          </div>
          HRAnalyst
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="mb-2 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </div>
        <nav className="grid gap-1 px-3">
          {items.map((item) => (
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
      
      <div className="border-t p-4">
         <div className="text-center text-xs text-slate-500">
            &copy; 2026 HRAnalyst
         </div>
      </div>
    </aside>
  );
}
