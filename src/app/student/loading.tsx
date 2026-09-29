import { SkeletonCard } from "@/components/ui/loading-state";

export default function Loading() {
  return (
    <div className="p-8 space-y-6">
      <div className="h-8 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-96 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
