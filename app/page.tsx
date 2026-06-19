"use client"

import { useState } from "react"
import { Sidebar, type ModuleKey } from "@/components/sidebar"
import { SeeModule } from "@/components/see-module"
import { DecideModule } from "@/components/decide-module"
import { ActModule } from "@/components/act-module"
import { OverviewModule } from "@/components/overview-module"
import { MonitorModule } from "@/components/monitor-module"
import { SettingsModule } from "@/components/settings-module"
import { AIAgentPanel } from "@/components/ai-agent-panel"
import { Bell, ChevronDown, CircleHelp, Construction, Filter, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { activeIncident, getRecoveryPlan, type ScenarioIncident } from "@/lib/workflow-data"

const titles: Record<ModuleKey, { title: string; sub: string }> = {
  overview: { title: "Overview", sub: "Network-wide resilience summary" },
  see: { title: "See: End-to-End Visibility and Early Warning", sub: "Live view of the supply chain network and risk signals" },
  decide: { title: "Decide: Scenario Simulation and Route Optimisation", sub: "Compare recovery options and select the best response" },
  act: { title: "Act — Customer Transparency & Recovery", sub: "Disruption status and recovery plan execution" },
  monitor: { title: "Monitor", sub: "Post-recovery tracking and SLA compliance" },
  settings: { title: "Settings", sub: "Workspace and notification preferences" },
}

function Placeholder({ name }: { name: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Construction className="size-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">{name} module</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        This area is part of the ChainGuard roadmap. Use the <span className="font-medium text-foreground">See</span> and{" "}
        <span className="font-medium text-foreground">Act</span> modules to explore the live prototype.
      </p>
    </div>
  )
}

export default function Page() {
  const [active, setActive] = useState<ModuleKey>("see")
  const [aiOpen, setAiOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [incident, setIncident] = useState<ScenarioIncident>(activeIncident)
  const meta = titles[active]
  const timestamp = "Jun 06, 2026 · 10:42 SGT"
  const recoveryPlan = getRecoveryPlan(incident)
  const effectiveSidebarCollapsed = sidebarCollapsed || aiOpen

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Sidebar
        active={active}
        onSelect={setActive}
        collapsed={effectiveSidebarCollapsed}
        onToggle={() => {
          if (aiOpen) {
            setAiOpen(false)
            return
          }
          setSidebarCollapsed((collapsed) => !collapsed)
        }}
      />

      <div
        className={cn(
          "min-w-0 overflow-x-hidden transition-[padding] duration-300 ease-out",
          effectiveSidebarCollapsed ? "pl-16" : "pl-60",
          aiOpen && "pr-[372px]",
        )}
      >
        {active !== "decide" && active !== "act" && (
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-border bg-background/90 px-6 py-3.5 backdrop-blur">
            <div className="flex min-w-0 items-center gap-2">
              {active === "see" && <span className="h-8 w-1 rounded-full bg-primary" aria-hidden />}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-xl font-bold tracking-normal text-foreground">{meta.title}</h1>
                  {active === "see" && <Info className="size-4 shrink-0 text-muted-foreground" />}
                </div>
                {active !== "see" && <p className="truncate text-xs text-muted-foreground">{meta.sub}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
                <span className="absolute right-1.5 top-1 flex size-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white ring-2 ring-card">8</span>
              </button>
              <button className="hidden size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground md:flex" aria-label="Help">
                <CircleHelp className="size-4" />
              </button>
              <span className="hidden h-8 w-px bg-border md:block" />
              <button className="hidden size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground lg:flex" aria-label="Filters">
                <Filter className="size-4" />
              </button>
              <button className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground lg:flex">
                Last 24 hours
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </button>
              <div className="flex items-center rounded-full border-2 border-danger px-3 py-1">
                <span className="text-lg font-bold text-primary">Infineon</span>
              </div>
            </div>
          </header>
        )}

        <main className={cn("min-w-0 overflow-x-hidden py-4", aiOpen ? "px-4" : "px-6")}>
          {active === "see" && <SeeModule incident={incident} recoveryPlan={recoveryPlan} />}
          {active === "decide" && <DecideModule incident={incident} onIncidentChange={setIncident} />}
          {active === "act" && <ActModule incident={incident} recoveryPlan={recoveryPlan} />}
          {active === "overview" && <OverviewModule incident={incident} recoveryPlan={recoveryPlan} />}
          {active === "monitor" && <MonitorModule incident={incident} recoveryPlan={recoveryPlan} />}
          {active === "settings" && <SettingsModule />}
          {active !== "overview" && active !== "see" && active !== "decide" && active !== "act" && active !== "monitor" && active !== "settings" && (
            <Placeholder name={meta.title.split(" ")[0]} />
          )}

          {active !== "see" && (
            <footer className="mt-8 border-t border-border pt-4 text-center text-xs text-muted-foreground">
              Infineon Technologies © 2026 · All rights reserved · Last updated: {timestamp}
            </footer>
          )}
        </main>
      </div>
      <AIAgentPanel active={active} open={aiOpen} onOpenChange={setAiOpen} incident={incident} recoveryPlan={recoveryPlan} />
    </div>
  )
}
