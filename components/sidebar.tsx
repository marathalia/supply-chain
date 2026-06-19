"use client"

import { cn } from "@/lib/utils"
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye,
  GitBranch,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Zap,
} from "lucide-react"

export type ModuleKey = "overview" | "see" | "decide" | "act" | "monitor" | "settings"

const items: { key: ModuleKey; label: string; icon: typeof Eye }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "see", label: "See", icon: Eye },
  { key: "decide", label: "Decide", icon: GitBranch },
  { key: "act", label: "Act", icon: Zap },
  { key: "monitor", label: "Monitor", icon: Activity },
  { key: "settings", label: "Settings", icon: Settings },
]

export function Sidebar({
  active,
  onSelect,
  collapsed,
  onToggle,
}: {
  active: ModuleKey
  onSelect: (key: ModuleKey) => void
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-sidebar transition-[width] duration-300 ease-out",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className={cn("flex items-center gap-2.5 py-4", collapsed ? "justify-center px-2" : "px-5")}>
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" />
        </div>
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">ChainGuard</p>
              <p className="truncate text-[11px] text-muted-foreground">Resilience Command</p>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Hide sidebar"
            >
              <ChevronLeft className="size-4" />
            </button>
          </>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={onToggle}
          className="mx-auto mb-2 flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm transition hover:bg-secondary hover:text-foreground"
          aria-label="Show sidebar"
        >
          <ChevronRight className="size-4" />
        </button>
      )}

      <nav className={cn("flex flex-1 flex-col gap-1 py-2", collapsed ? "items-center px-2" : "px-3")} aria-label="Primary">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.key
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-md text-sm font-medium transition-colors",
                collapsed ? "size-10 justify-center" : "w-full gap-3 px-3 py-2.5",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon className="size-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && <span className="ml-auto size-1.5 rounded-full bg-primary" aria-hidden />}
            </button>
          )
        })}
      </nav>

      <div className={cn("border-t border-border py-4", collapsed ? "px-2" : "px-5")}>
        <div className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
          <div className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            OS
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-xs font-medium text-foreground">Operations Team</p>
              <p className="text-[11px] text-muted-foreground">Infineon EMEA</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
