import { FolderOpen } from "lucide-react"

export function EmptyState({
  title = "No results found",
  description = "Get started by creating a new entry or adjusting your filters.",
  icon: Icon = FolderOpen,
  action,
}: {
  title?: string
  description?: string
  icon?: React.ElementType
  action?: React.ReactNode
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-slate-50/50 p-8 text-center animate-in fade-in-50 dark:bg-slate-900/50">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Icon className="h-10 w-10 text-slate-400" />
      </div>
      <h2 className="mt-6 text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 mb-8 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {action}
    </div>
  )
}
