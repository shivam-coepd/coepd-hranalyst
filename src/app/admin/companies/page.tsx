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
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50">
              <tr>
                <th className="p-4 font-medium text-muted-foreground">Company</th>
                <th className="p-4 font-medium text-muted-foreground">Domain</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground">Active</th>
                <th className="p-4 font-medium text-right text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {r.companies.map((c) => {
                let statusVariant: "default" | "success" | "warning" | "destructive" | "pending" | "secondary" = "secondary";
                if (c.verification_status === "verified") statusVariant = "success";
                if (c.verification_status === "pending") statusVariant = "pending";
                if (c.verification_status === "rejected") statusVariant = "destructive";

                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-4">
                      <div className="font-medium text-foreground">{c.name}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">{c.domain ?? "—"}</td>
                    <td className="p-4">
                      <Badge variant={statusVariant} className="capitalize">
                        {c.verification_status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={c.is_active ? "success" : "secondary"}>
                        {c.is_active ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/companies/${c.id}`}>
                        <Button variant="ghost" size="sm">Open</Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {r.companies.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    No companies found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  );
}

