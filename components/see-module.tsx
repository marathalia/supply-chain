"use client"

import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Bell,
  Boxes,
  CircleHelp,
  ClipboardList,
  Factory,
  Filter,
  Gauge,
  Globe2,
  Network,
  PackageCheck,
  Shield,
  Truck,
  Users,
} from "lucide-react"
import {
  alerts,
  chipFamilies,
  downstreamStats,
  impactedOrders,
  kpis,
  riskContributors,
  riskTrend,
} from "@/lib/data"
import { RiskBadge, SeverityBadge } from "@/components/status-badge"
import { SupplyMap } from "@/components/supply-map"
import { TrendChart } from "@/components/trend-chart"
import type { RecoveryPlan, ScenarioIncident } from "@/lib/workflow-data"

const familyTone: Record<string, string> = {
  A: "border-success/35 text-success",
  B: "border-warning/45 text-warning-foreground",
  C: "border-danger/35 text-danger",
  D: "border-warning/45 text-warning-foreground",
}

const kpiIcons = [Boxes, Network, AlertTriangle, ClipboardList, Globe2, Shield]
const downstreamIcons = [ClipboardList, Users, Truck, Factory, PackageCheck, Gauge]

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-md border border-border bg-card shadow-sm", className)}>{children}</section>
}

function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
        <CircleHelp className="size-3.5 shrink-0 text-muted-foreground" />
      </div>
      {action}
    </div>
  )
}

function deriveSeeData(incident: ScenarioIncident) {
  const pageKpis = kpis.map((kpi) => {
    if (kpi.label === "Impacted Orders") return { ...kpi, value: incident.totalImpactedOrders.toLocaleString(), delta: { dir: "up", text: `${Math.round(incident.disruptionProb / 2)}% vs baseline` } }
    if (kpi.label === "Live Risk Alerts") return { ...kpi, value: incident.shortageRisk === "High" ? "19" : "14", delta: { dir: "up", text: `${Math.max(4, Math.round(incident.disruptionProb / 8))} new signals` } }
    if (kpi.label === "Avg. Node Risk Score") return { ...kpi, value: `${Math.round((56 + incident.riskScore) / 2)} / 100`, delta: { dir: "up", text: `${Math.max(4, incident.riskScore - 64)} vs baseline` } }
    return kpi
  })

  const pageFamilies = chipFamilies.map((family) =>
    family.id === incident.affectedFamilyId
      ? {
          ...family,
          risk: incident.shortageRisk,
          delayDays: incident.delayDays,
          riskScore: incident.riskScore,
          disruptionProb: incident.disruptionProb,
        }
      : family,
  )

  const pageDownstream = downstreamStats.map((stat) => {
    if (stat.label === "Affected Orders") return { ...stat, value: incident.totalImpactedOrders.toLocaleString() }
    if (stat.label === "Affected Customers") return { ...stat, value: incident.impactedCustomers.toString() }
    if (stat.label === "Revenue at Risk") return { ...stat, value: incident.revenueAtRisk }
    if (stat.label === "Production Slowdown") return { ...stat, value: incident.productionSlowdown }
    if (stat.label === "Shortage Risk") return { ...stat, value: incident.shortageRisk }
    if (stat.label === "Est. Service Impact") return { ...stat, value: incident.serviceImpact }
    return stat
  })

  const pageRiskContributors = [
    { factor: incident.type, impact: incident.shortageRisk, score: Math.max(24, Math.round(incident.riskScore * 0.42)) },
    { factor: "Route Exposure", impact: incident.riskScore > 74 ? "High" as const : "Medium" as const, score: Math.max(14, Math.round(incident.riskScore * 0.22)) },
    { factor: "Customer SLA Pressure", impact: incident.serviceImpact === "Severe" ? "High" as const : "Medium" as const, score: Math.max(12, Math.round(incident.impactedCustomers / 9)) },
    { factor: "Logistics Feasibility", impact: "Medium" as const, score: 14 },
    { factor: "Inventory Buffer", impact: incident.shortageRisk, score: 12 },
  ]

  const pageRiskTrend = riskTrend.map((value, index) => Math.min(95, Math.max(24, value + Math.round((incident.riskScore - 68) * (index + 1) / riskTrend.length))))

  const mainOrders = incident.affectedOrders
  const remaining = Math.max(0, incident.totalImpactedOrders - mainOrders)
  const otherOrders = impactedOrders.filter((order) => order.id !== incident.affectedFamilyId)
  const pageImpactedOrders = [
    {
      id: incident.affectedFamilyId,
      family: incident.affectedChipFamily,
      orders: mainOrders,
      pct: Number(((mainOrders / incident.totalImpactedOrders) * 100).toFixed(1)),
      customers: "Bosch, Continental, Dell, Samsung SDI",
    },
    ...otherOrders.slice(0, 3).map((order, index) => {
      const orders = Math.max(36, Math.round(remaining * ([0.46, 0.32, 0.22][index] ?? 0.2)))
      return { ...order, orders, pct: Number(((orders / incident.totalImpactedOrders) * 100).toFixed(1)) }
    }),
  ]

  return { pageKpis, pageFamilies, pageDownstream, pageRiskContributors, pageRiskTrend, pageImpactedOrders }
}

export function SeeModule({ incident, recoveryPlan }: { incident: ScenarioIncident; recoveryPlan: RecoveryPlan }) {
  const { pageKpis, pageFamilies, pageDownstream, pageRiskContributors, pageRiskTrend, pageImpactedOrders } = deriveSeeData(incident)
  return (
    <div className="space-y-4 pb-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {pageKpis.map((kpi, index) => {
          const Icon = kpiIcons[index]
          const isDanger = kpi.label === "Live Risk Alerts" || kpi.label === "Impacted Orders"
          const isWarning = kpi.label === "Avg. Node Risk Score"

          return (
            <div key={kpi.label} className="flex min-h-[76px] gap-3 rounded-md border border-border bg-card p-3 shadow-sm">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-full border",
                  index === 0 && "border-success/20 bg-success-muted text-success",
                  index === 1 && "border-primary/20 bg-accent text-primary",
                  isDanger && "border-danger/20 bg-danger-muted text-danger",
                  index === 4 && "border-muted-foreground/20 bg-secondary text-muted-foreground",
                  isWarning && "border-warning/30 bg-warning-muted text-warning-foreground",
                )}
              >
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-tight text-muted-foreground">{kpi.label}</p>
                <p className="text-2xl font-semibold tabular-nums text-foreground">{kpi.value}</p>
                {kpi.delta ? (
                  <p
                    className={cn(
                      "mt-1 flex items-center gap-1 text-[10px] font-semibold",
                      isDanger ? "text-danger" : isWarning ? "text-warning-foreground" : "text-success",
                    )}
                  >
                    <ArrowUp className="size-3" />
                    {kpi.delta.text}
                  </p>
                ) : (
                  <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                    <ArrowDown className="size-3" />
                    No change
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Card>
        <CardHeader
          title="Chip Family Supply Map"
          action={
            <div className="hidden items-center gap-2 lg:flex">
              <span className="text-[11px] font-medium text-muted-foreground">View by:</span>
              <button className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground">Chip Families</button>
              <button className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground">
                <Filter className="size-3.5" />
                Filters
              </button>
            </div>
          }
        />
        <div className="p-2">
          <SupplyMap focusFamily={incident.affectedFamilyId} />
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader title="Delay Impact by Chip Family" />
            <div className="p-4">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="w-[24%] px-3 py-3 font-semibold">Chip Family</th>
                    <th className="w-[36%] px-3 py-3 font-semibold">Current Location / Route</th>
                    <th className="w-[16%] px-3 py-3 font-semibold">Risk Level</th>
                    <th className="w-[10%] px-3 py-3 font-semibold">Est. Delay</th>
                    <th className="w-[14%] px-3 py-3 text-right font-semibold">Risk Score</th>
                  </tr>
                </thead>
                <tbody>
                  {pageFamilies.map((f) => (
                    <tr key={f.id} className="border-b border-border last:border-b-0">
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <span className={cn("flex size-9 items-center justify-center rounded-full border bg-card", familyTone[f.id])}>
                            <Boxes className="size-4" />
                          </span>
                          <span className="font-semibold leading-tight text-foreground">{f.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 leading-relaxed text-muted-foreground">{f.route}</td>
                      <td className="px-3 py-4">
                        <RiskBadge level={f.risk} className="rounded-md px-3" />
                      </td>
                      <td className="px-3 py-4 font-semibold tabular-nums text-foreground">{f.delayDays}d</td>
                      <td
                        className={cn(
                          "px-3 py-4 text-right text-xl font-semibold tabular-nums",
                          f.risk === "High" ? "text-danger" : f.risk === "Medium" ? "text-warning-foreground" : "text-success",
                        )}
                      >
                        {f.riskScore}
                        <span className="text-sm text-muted-foreground">/100</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="h-full">
            <CardHeader title="Downstream Consequences (If Delayed)" />
            <div className="grid h-[calc(100%-42px)] grid-cols-2 grid-rows-3 gap-3 p-4 sm:grid-rows-2 lg:grid-cols-3">
              {pageDownstream.map((s, index) => {
                const Icon = downstreamIcons[index]
                return (
                  <div key={s.label} className="flex min-h-[120px] flex-col justify-between rounded-md border border-border p-4">
                    <div>
                      <Icon className="size-5 text-muted-foreground" />
                      <p className="mt-3 text-xs font-semibold leading-tight text-muted-foreground">{s.label}</p>
                    </div>
                    <p
                      className={cn(
                        "mt-3 break-words text-xl font-bold tabular-nums",
                        s.tone === "danger" ? "text-danger" : s.tone === "warning" ? "text-warning-foreground" : "text-foreground",
                      )}
                    >
                      {s.value}
                    </p>
                  </div>
                )
	              })}
	            </div>
	          </Card>
	      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(300px,0.9fr)_minmax(340px,0.95fr)_minmax(0,1.45fr)]">
        <Card>
          <CardHeader title="Live Alert Feed" action={<button className="text-xs font-semibold text-primary">View all</button>} />
          <ul className="divide-y divide-border px-4">
            {alerts.map((a) => (
              <li key={a.id} className="flex gap-3 py-3">
                <div
                  className={cn(
                    "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
                    a.severity === "High" ? "bg-danger-muted text-danger" : "bg-warning-muted text-warning-foreground",
                  )}
                >
                  <Bell className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug text-foreground">
                    {a.category}: <span className="font-medium">{a.title}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <SeverityBadge level={a.severity} />
                    <span>{a.source}</span>
                    <span>{a.time}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title={`${incident.affectedChipFamily} Drilldown`} action={<button className="text-xs font-semibold text-primary">View full profile</button>} />
          <div className="grid gap-3 p-3">
            <div className="overflow-hidden rounded-md border border-border">
              <div className="bg-muted/60 px-4 py-2.5 text-sm font-semibold text-foreground">Risk Contributors</div>
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="px-4 py-2.5 font-semibold">Factor</th>
                    <th className="px-4 py-2.5 font-semibold">Impact</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRiskContributors.map((c) => (
                    <tr key={c.factor} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-2.5 text-foreground">{c.factor}</td>
                      <td className="px-4 py-2.5">
                        <RiskBadge level={c.impact} className="rounded-md" />
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-danger">+{c.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-3">
                <span className="text-sm font-semibold text-foreground">Total Risk Score</span>
                <span className="text-2xl font-semibold text-warning-foreground">
                  {incident.riskScore} <span className="text-sm text-muted-foreground">/100</span>
                </span>
              </div>
            </div>

            <div className="rounded-md border border-border p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  Risk Score Trend <span className="text-muted-foreground">(Last 14 Days)</span>
                </p>
                <span className="rounded-md bg-warning px-2 py-1 text-xs font-bold text-white">{incident.riskScore}</span>
              </div>
              <TrendChart data={pageRiskTrend} height={190} />
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Disruption Probability</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full w-[29%] rounded-full bg-warning" />
                  </div>
                  <p className="mt-1 text-right text-xs font-semibold text-foreground">{incident.disruptionProb}%</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground">Est. Delay</p>
                  <p className="mt-2 text-lg font-bold text-foreground">{incident.delayDays} days</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Impacted Orders by Chip Family" action={<button className="text-xs font-semibold text-primary">View all</button>} />
          <div className="p-3">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="w-[24%] px-3 py-3 font-semibold">Chip Family</th>
                  <th className="w-[16%] px-3 py-3 text-right font-semibold">Orders</th>
                  <th className="w-[16%] px-3 py-3 text-right font-semibold">% Total</th>
                  <th className="w-[44%] px-3 py-3 font-semibold">Top Customers</th>
                </tr>
              </thead>
              <tbody>
                {pageImpactedOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-b-0">
                    <td className="px-3 py-3">
                      <span className={cn("mr-2 inline-flex size-6 items-center justify-center rounded-full border align-middle", familyTone[o.id])}>
                        <Boxes className="size-3.5" />
                      </span>
                      <span className="whitespace-nowrap font-semibold text-foreground">{o.family}</span>
                    </td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums text-foreground">{o.orders.toLocaleString()}</td>
                    <td className="px-3 py-3 text-right font-semibold tabular-nums text-foreground">{o.pct}%</td>
                    <td className="px-3 py-3 text-muted-foreground">{o.customers}</td>
                  </tr>
                ))}
                <tr>
                  <td className="px-3 py-3 font-bold text-foreground">Total</td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums text-foreground">{incident.totalImpactedOrders.toLocaleString()}</td>
                  <td className="px-3 py-3 text-right font-bold tabular-nums text-foreground">100%</td>
                  <td className="px-3 py-3 text-muted-foreground" />
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
