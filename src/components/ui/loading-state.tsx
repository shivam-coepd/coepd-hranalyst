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
