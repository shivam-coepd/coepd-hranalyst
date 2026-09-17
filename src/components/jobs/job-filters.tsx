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

export function JobFilters({
  defaultSearch = "",
  defaultStatus = "",
  defaultRoleType = "",
}: {
  defaultSearch?: string;
  defaultStatus?: string;
  defaultRoleType?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(defaultSearch);
  const [status, setStatus] = useState(defaultStatus);
  const [roleType, setRoleType] = useState(defaultRoleType);

  const applyFilters = useCallback((overrideStatus?: string, overrideRoleType?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    const finalStatus = overrideStatus !== undefined ? overrideStatus : status;
    if (finalStatus) {
      params.set("status", finalStatus);
    } else {
      params.delete("status");
    }

    const finalRoleType = overrideRoleType !== undefined ? overrideRoleType : roleType;
    if (finalRoleType) {
      params.set("roleType", finalRoleType);
    } else {
      params.delete("roleType");
    }

    // Reset to page 1 when filtering
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  }, [search, status, roleType, pathname, router, searchParams]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    applyFilters(newStatus, roleType);
  };

  return (
    <div className="flex items-center gap-4 border-b p-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search job title, code, or location..." 
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <select 
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
        value={status}
        onChange={handleStatusChange}
      >
        <option value="">All Statuses</option>
        <option value="draft">Draft</option>
        <option value="pending_checklist">Pending</option>
        <option value="published">Published</option>
        <option value="closed">Closed</option>
      </select>
      
      <Sheet>
        <SheetTrigger render={<Button variant="outline" className="h-9 px-4 py-2 text-sm font-normal" />}>
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Advanced Filters</SheetTitle>
            <SheetDescription>
              Narrow down the jobs list by applying additional filters.
            </SheetDescription>
          </SheetHeader>
          
          <div className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground tracking-tight">Role Type</label>
                {roleType && (
                  <button 
                    onClick={() => {
                      setRoleType("");
                      applyFilters(status, "");
                    }}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "", label: "All Roles", icon: "🏢" },
                  { id: "BA", label: "Business Analyst", icon: "📊" },
                  { id: "PO", label: "Product Owner", icon: "🎯" },
                  { id: "PM", label: "Project Manager", icon: "📈" },
                  { id: "SM", label: "Scrum Master", icon: "🔄" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRoleType(r.id);
                      applyFilters(status, r.id);
                    }}
                    className={`
                      flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all duration-200
                      ${roleType === r.id 
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm" 
                        : "border-border bg-card hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm"
                      }
                    `}
                  >
                    <span className="text-xl">{r.icon}</span>
                    <span className={`text-sm ${roleType === r.id ? "font-semibold text-primary" : "font-medium text-foreground"}`}>
                      {r.label}
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
