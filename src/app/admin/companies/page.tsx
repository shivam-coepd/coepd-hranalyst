import Link from "next/link";
import { requireAdmin } from "@/lib/auth/guards";
import { getCompanies } from "@/repositories/companies.repository";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CompanyFilters } from "./company-filters";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; isActive?: string }>;
}) {
  await requireAdmin();
  const p = await searchParams;
  const r = await getCompanies({ search: p.search, status: p.status, isActive: p.isActive });
  
  return (
    <main className="p-8">
      <PageHeader
        title="Companies"
        description="Verify and manage client organizations."
        actions={
          <Link href="/admin/companies/new">
            <Button variant="create">
              <Plus className="mr-2 h-4 w-4" />
              Add company
            </Button>
          </Link>
        }
      />
      
      <Card>
        <CompanyFilters 
          defaultSearch={p.search} 
          defaultStatus={p.status} 
          defaultIsActive={p.isActive}
        />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
        {r.companies.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed bg-slate-50/50 p-12 text-center text-muted-foreground">
            No companies found. Add one to get started.
          </div>
        )}
        {r.companies.map((c) => {
          let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
          if (c.verification_status === "verified") statusVariant = "success";
          if (c.verification_status === "pending") statusVariant = "pending";
          if (c.verification_status === "rejected") statusVariant = "destructive";

          return (
            <Link
              href={`/admin/companies/${c.id}`}
              key={c.id}
              className="group flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-md dark:bg-slate-950"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-indigo-900/50 dark:text-indigo-400">
                    <span className="font-semibold text-lg">{c.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <Badge variant={statusVariant} className="capitalize">{c.verification_status}</Badge>
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {c.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                  {c.domain ?? "—"}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs font-medium text-muted-foreground">
                <Badge variant={c.is_active ? "success" : "secondary"}>
                  {c.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </Link>
          );
        })}
        </div>
      </Card>
    </main>
  );
}

