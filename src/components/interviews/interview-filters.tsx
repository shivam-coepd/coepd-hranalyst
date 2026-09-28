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

export function InterviewFilters({
  defaultSearch = "",
  defaultStatus = "",
  defaultMode = "",
}: {
  defaultSearch?: string;
  defaultStatus?: string;
  defaultMode?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(defaultSearch);
  const [status, setStatus] = useState(defaultStatus);
  const [mode, setMode] = useState(defaultMode);

  const applyFilters = useCallback((overrideStatus?: string, overrideMode?: string) => {
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

    const finalMode = overrideMode !== undefined ? overrideMode : mode;
    if (finalMode) {
      params.set("mode", finalMode);
    } else {
      params.delete("mode");
    }

    // Reset to page 1 when filtering
    params.delete("page");

    router.push(`${pathname}?${params.toString()}`);
  }, [search, status, mode, pathname, router, searchParams]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    applyFilters(newStatus, mode);
  };

  return (
    <div className="flex items-center gap-4 border-b p-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search candidates, codes, or companies..." 
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
        <option value="scheduled">Scheduled</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
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
              Narrow down the interviews list by applying additional filters.
            </SheetDescription>
          </SheetHeader>
          
          <div className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground tracking-tight">Interview Mode</label>
                {mode && (
                  <button 
                    onClick={() => {
                      setMode("");
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
                  { id: "", label: "All Modes", icon: "🗓️" },
                  { id: "online", label: "Online", icon: "🌐" },
                  { id: "offline", label: "Offline", icon: "🏢" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setMode(m.id);
                      applyFilters(status, m.id);
                    }}
                    className={`
                      flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all duration-200
                      ${mode === m.id 
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm" 
                        : "border-border bg-card hover:border-primary/50 hover:bg-accent/50 hover:shadow-sm"
                      }
                    `}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <span className={`text-sm ${mode === m.id ? "font-semibold text-primary" : "font-medium text-foreground"}`}>
                      {m.label}
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
