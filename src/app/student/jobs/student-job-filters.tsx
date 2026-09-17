"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function StudentJobFilters({
  defaultSearch = "",
  defaultRole = "",
  defaultWorkplace = "",
}: {
  defaultSearch?: string;
  defaultRole?: string;
  defaultWorkplace?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(defaultSearch);
  const [role, setRole] = useState(defaultRole);
  const [workplace, setWorkplace] = useState(defaultWorkplace);

  const applyFilters = useCallback((overrideRole?: string, overrideWorkplace?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) {
      params.set("q", search);
    } else {
      params.delete("q");
    }

    const finalRole = overrideRole !== undefined ? overrideRole : role;
    if (finalRole) {
      params.set("role", finalRole);
    } else {
      params.delete("role");
    }

    const finalWorkplace = overrideWorkplace !== undefined ? overrideWorkplace : workplace;
    if (finalWorkplace) {
      params.set("workplace", finalWorkplace);
    } else {
      params.delete("workplace");
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [search, role, workplace, pathname, router, searchParams]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setRole(newRole);
    applyFilters(newRole, workplace);
  };

  return (
    <div className="mt-8 flex items-center gap-4 border-b pb-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search title, location, or code..." 
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <select 
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
        value={role}
        onChange={handleRoleChange}
      >
        <option value="">All Roles</option>
        <option value="BA">Business Analyst</option>
        <option value="PO">Product Owner</option>
        <option value="PM">Project Manager</option>
        <option value="SM">Scrum Master</option>
      </select>
      
      <Sheet>
        <SheetTrigger render={<Button variant="outline" className="h-9 px-4 py-2 text-sm font-normal" />}>
          <Filter className="mr-2 h-4 w-4" />
          Workplace Filters
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Workplace Preferences</SheetTitle>
            <SheetDescription>
              Filter jobs by your preferred working environment.
            </SheetDescription>
          </SheetHeader>
          
          <div className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground tracking-tight">Workplace Type</label>
                {workplace && (
                  <button 
                    onClick={() => {
                      setWorkplace("");
                      applyFilters(role, "");
                    }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "", label: "All Types", icon: "🌍" },
                  { id: "onsite", label: "Onsite", icon: "🏢" },
                  { id: "hybrid", label: "Hybrid", icon: "🔄" },
                  { id: "remote", label: "Remote", icon: "🏠" },
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setWorkplace(w.id);
                      applyFilters(role, w.id);
                    }}
                    className={`
                      flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all duration-200
                      ${workplace === w.id 
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm" 
                        : "border-border bg-card hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm"
                      }
                    `}
                  >
                    <span className="text-xl">{w.icon}</span>
                    <span className={`text-sm ${workplace === w.id ? "font-semibold text-primary" : "font-medium text-foreground"}`}>
                      {w.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
