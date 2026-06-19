import { cn } from "@/lib/utils"
import type { RiskLevel } from "@/lib/data"

const riskStyles: Record<RiskLevel, string> = {
  Low: "bg-success-muted text-success border-success/30",
  Medium: "bg-warning-muted text-warning-foreground border-warning/40",
  High: "bg-danger-muted text-danger border-danger/30",
}

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        riskStyles[level],
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          level === "Low" && "bg-success",
          level === "Medium" && "bg-warning",
          level === "High" && "bg-danger",
        )}
        aria-hidden
      />
      {level}
    </span>
  )
}

export function SeverityBadge({ level }: { level: "High" | "Medium" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        level === "High"
          ? "bg-danger-muted text-danger border-danger/30"
          : "bg-warning-muted text-warning-foreground border-warning/40",
      )}
    >
      {level}
    </span>
  )
}
