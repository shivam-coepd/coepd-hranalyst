import { Card, CardContent } from "@/components/ui/card"
import { cn } from "cn"

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: {
  title: string
  value: string | number
  description?: string
  icon?: React.ElementType
  trend?: {
    value: number
    label: string
  }
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium tracking-tight text-muted-foreground">
            {title}
          </p>
          {Icon && (
            <Icon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-3xl font-bold">{value}</div>
          
          {(description || trend) && (
            <div className="flex items-center text-xs">
              {trend && (
                <span
                  className={cn(
                    "mr-2 font-medium",
                    trend.value > 0
                      ? "text-green-600 dark:text-green-400"
                      : trend.value < 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  )}
                >
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}%
                </span>
              )}
              <span className="text-muted-foreground">
                {trend?.label || description}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
