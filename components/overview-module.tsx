"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { alerts, chipFamilies, downstreamStats, impactedOrders, kpis, riskTrend } from "@/lib/data"
import { RiskBadge, SeverityBadge } from "@/components/status-badge"
import { TrendChart } from "@/components/trend-chart"
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  CircleHelp,
  Clock,
  Globe2,
  PackageCheck,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react"
import { activeIncident, selectedRecoveryPlan, type RecoveryPlan, type ScenarioIncident } from "@/lib/workflow-data"

const kpiIcons = [Boxes, Activity, AlertTriangle, PackageCheck, Globe2, ShieldCheck]

function Card({ children, className }: React.ComponentProps<"section">) {
  return <section className={cn("rounded-md border border-border bg-card shadow-sm", className)}>{children}</section>
}

function Header({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="truncate text-sm font-bold text-foreground">{title}</h2>
        <CircleHelp className="size-4 shrink-0 text-muted-foreground" />
      </div>
      {action}
    </div>
  )
}

export function OverviewModule({
  incident = activeIncident,
  recoveryPlan = selectedRecoveryPlan,
}: {
  incident?: ScenarioIncident
  recoveryPlan?: RecoveryPlan
}) {
  const [focus, setFocus] = useState("Orders")
  const focusedStat = useMemo(() => downstreamStats.find((stat) => stat.label.includes(focus)) ?? downstreamStats[0], [focus])

  return (
    <div className="space-y-4 pb-8">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi, index) => {
          const Icon = kpiIcons[index]
          const danger = kpi.label === "Live Risk Alerts" || kpi.label === "Impacted Orders"
          const warning = kpi.label === "Avg. Node Risk Score"
          return (
            <button key={kpi.label} className="rounded-md border border-border bg-card p-3 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full border",
                    danger && "border-danger/20 bg-danger-muted text-danger",
                    warning && "border-warning/30 bg-warning-muted text-warning-foreground",
                    !danger && !warning && "border-primary/15 bg-accent text-primary",
                  )}
                >
                  <Icon className="size-5" />
                </span>
                {kpi.delta && <ArrowUpRight className={cn("size-4", danger || warning ? "text-danger" : "text-success")} />}
              </div>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">{kpi.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">{kpi.value}</p>
              <p className="mt-1 text-[11px] font-semibold text-muted-foreground">{kpi.delta?.text ?? "No change"}</p>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <Card>
          <Header
            title="Resilience Command Summary"
            action={
              <div className="flex rounded-lg border border-border bg-background p-1">
                {["Orders", "Customers", "Service"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setFocus(item)}
                    className={cn("rounded-md px-3 py-1.5 text-xs font-bold", focus === item ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                  >
                    {item}
                  </button>
                ))}
              </div>
            }
          />
          <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <div className="rounded-md border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-muted-foreground">Current operational focus</p>
                <p className="mt-2 text-3xl font-bold text-foreground">{focusedStat.value}</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {focusedStat.label} is the active executive lens. The active incident is {incident.type.toLowerCase()} for {incident.affectedChipFamily}; the current response is {recoveryPlan.title}.
                </p>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {[
                  { label: "Open incidents", value: "7", icon: AlertTriangle, tone: "text-danger bg-danger-muted" },
                  { label: "Stable routes", value: "21", icon: CheckCircle2, tone: "text-success bg-success-muted" },
                  { label: "Next review", value: "11:30", icon: Clock, tone: "text-primary bg-accent" },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-md border border-border p-3">
                      <Icon className={cn("size-8 rounded-lg p-1.5", item.tone)} />
                      <p className="mt-3 text-xs font-semibold text-muted-foreground">{item.label}</p>
                      <p className="text-xl font-bold text-foreground">{item.value}</p>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-sm font-bold text-foreground">Risk Score Trend</p>
              <TrendChart data={riskTrend} height={190} />
              <div className="mt-4 flex items-center justify-between rounded-lg bg-warning-muted px-3 py-2">
                <span className="text-xs font-bold text-warning-foreground">Avg. network score</span>
                <span className="text-2xl font-bold text-warning-foreground">56</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <Header title="Priority Alerts" action={<button className="text-xs font-bold text-primary">View all</button>} />
          <ul className="divide-y divide-border px-4">
            {alerts.slice(0, 4).map((alert) => (
              <li key={alert.id} className="py-3">
                <div className="flex items-start gap-3">
                  <span className={cn("mt-0.5 flex size-8 items-center justify-center rounded-full", alert.severity === "High" ? "bg-danger-muted text-danger" : "bg-warning-muted text-warning-foreground")}>
                    <AlertTriangle className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground">{alert.category}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{alert.title}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <SeverityBadge level={alert.severity} />
                      <span>{alert.time}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card>
          <Header title="Chip Family Health" />
          <div className="p-4">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="py-3 font-bold">Family</th>
                  <th className="py-3 font-bold">Route</th>
                  <th className="py-3 font-bold">Risk</th>
                  <th className="py-3 text-right font-bold">Score</th>
                </tr>
              </thead>
              <tbody>
                {chipFamilies.map((family) => (
                  <tr key={family.id} className="border-b border-border last:border-b-0">
                    <td className="py-4 font-bold text-foreground">{family.name}</td>
                    <td className="py-4 text-muted-foreground">{family.route}</td>
                    <td className="py-4"><RiskBadge level={family.risk} /></td>
                    <td className="py-4 text-right text-lg font-bold tabular-nums text-foreground">{family.riskScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <Header title="Impacted Orders Snapshot" />
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {impactedOrders.map((order) => (
              <div key={order.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-foreground">{order.family}</p>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-muted-foreground">{order.pct}%</span>
                </div>
                <p className="mt-3 text-2xl font-bold tabular-nums text-foreground">{order.orders}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{order.customers}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
