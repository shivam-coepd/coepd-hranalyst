import { Loader2 } from "lucide-react"

export function LoadingState({
  message = "Loading data...",
}: {
  message?: string
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-slate-50/50 p-8 text-center dark:bg-slate-900/50">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export function SkeletonRow({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center space-x-4 py-3">
      {Array.from({ length: columns }).map((_, i) => (
        <div 
          key={i} 
          className="h-4 flex-1 animate-pulse rounded bg-slate-200 dark:bg-slate-800"
          style={{
            maxWidth: i === 0 ? "30%" : i === columns - 1 ? "10%" : "auto"
          }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col justify-between rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-950">
      <div>
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="mt-4 h-6 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="mt-4 flex items-center gap-4">
        <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  )
}
