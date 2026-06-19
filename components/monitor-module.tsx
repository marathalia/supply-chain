"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { TrendChart } from "@/components/trend-chart"
import {
  Activity,
  BellRing,
  CheckCircle2,
  CircleHelp,
  Clock,
  Gauge,
  MessageSquare,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react"
import {
  activeIncident,
  getCustomerOrders,
  getMonitorEvents,
  getMonitorLanes,
  selectedRecoveryPlan,
  type RecoveryPlan,
  type ScenarioIncident,
} from "@/lib/workflow-data"

function getMonitorKpis(incident: ScenarioIncident) {
  const recoveredOrders = Math.max(0, incident.totalImpactedOrders - Math.round(incident.totalImpactedOrders * 0.28))
  return [
    { label: "Recovery Progress", value: `${Math.max(48, 88 - Math.round(incident.riskScore / 3))}%`, tone: "text-primary bg-accent", icon: Activity },
    { label: "Orders Back on Track", value: recoveredOrders.toLocaleString(), tone: "text-success bg-success-muted", icon: PackageCheck },
    { label: "SLA Watchlist", value: Math.ceil(incident.totalImpactedOrders * 0.027).toString(), tone: "text-warning-foreground bg-warning-muted", icon: Clock },
    { label: "Escalations Open", value: incident.shortageRisk === "High" ? "5" : "3", tone: "text-danger bg-danger-muted", icon: BellRing },
  ]
}

function Card({ children, className }: React.ComponentProps<"section">) {
  return <section className={cn("rounded-md border border-border bg-card shadow-sm", className)}>{children}</section>
}

function Header({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        <CircleHelp className="size-4 text-muted-foreground" />
      </div>
      {action}
    </div>
  )
}

export function MonitorModule({
  incident = activeIncident,
  recoveryPlan = selectedRecoveryPlan,
}: {
  incident?: ScenarioIncident
  recoveryPlan?: RecoveryPlan
}) {
  const [range, setRange] = useState("24h")
  const baseTrend = range === "24h" ? [54, 56, 58, 61, 63, 66, 68, 69, 72] : [38, 42, 47, 49, 54, 61, 66, 72]
  const trend = baseTrend.map((value) => Math.max(24, Math.min(95, value + Math.round((incident.riskScore - 72) / 4))))
  const monitorKpis = getMonitorKpis(incident)
  const monitorEvents = getMonitorEvents(incident, recoveryPlan)
  const monitorLanes = getMonitorLanes(incident, recoveryPlan)
  const customerOrders = getCustomerOrders(incident, recoveryPlan)

  return (
    <div className="space-y-4 pb-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {monitorKpis.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className={cn("rounded-md p-4", item.tone)}>
              <Icon className="size-5" />
              <p className="mt-2 text-xs font-bold opacity-80">{item.label}</p>
              <p className="text-3xl font-bold tabular-nums">{item.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)]">
        <Card>
          <Header
            title="Recovery Performance"
            action={
              <div className="flex rounded-lg border border-border bg-background p-1">
                {["24h", "7d", "30d"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setRange(item)}
                    className={cn("rounded-md px-3 py-1.5 text-xs font-bold", range === item ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                  >
                    {item}
                  </button>
                ))}
              </div>
            }
          />
          <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="rounded-md border border-border bg-muted/10 p-3">
              <TrendChart data={trend} height={190} />
            </div>
            <div className="grid gap-3">
              {[
                ["Mean delay variance", "1.8 days", Gauge],
                ["Last checkpoint", "10:42 SGT", CheckCircle2],
                ["Next sync", "11:30 SGT", RefreshCcw],
              ].map(([label, value, Icon]) => (
                <div key={label as string} className="rounded-md border border-border p-3">
                  <Icon className="size-5 text-primary" />
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">{label as string}</p>
                  <p className="text-lg font-bold text-foreground">{value as string}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <Header title="Live Monitor Feed" />
          <ol className="divide-y divide-border px-4">
            {monitorEvents.map((event) => (
              <li key={event.time} className="flex gap-4 py-3">
                <span className="mt-1 text-xs font-bold tabular-nums text-muted-foreground">{event.time}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground">{event.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{event.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card>
        <Header title="Recovery Lane Tracker" action={<button className="text-xs font-bold text-primary">Export status</button>} />
        <div className="p-4">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="w-[34%] px-3 py-3 font-bold">Lane</th>
                <th className="w-[18%] px-3 py-3 font-bold">Owner</th>
                <th className="w-[16%] px-3 py-3 font-bold">ETA</th>
                <th className="w-[22%] px-3 py-3 font-bold">Progress</th>
                <th className="w-[10%] px-3 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {monitorLanes.map((lane) => (
                <tr key={lane.name} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-4 font-bold text-foreground">{lane.name}</td>
                  <td className="px-3 py-4 text-muted-foreground">{lane.owner}</td>
                  <td className="px-3 py-4 font-semibold text-foreground">{lane.eta}</td>
                  <td className="px-3 py-4">
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div className={cn("h-full rounded-full", lane.status === "At Risk" ? "bg-warning" : "bg-primary")} style={{ width: `${lane.progress}%` }} />
                    </div>
                    <p className="mt-1 text-xs font-bold text-muted-foreground">{lane.progress}% complete</p>
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-bold",
                        lane.status === "On Track" && "bg-success-muted text-success",
                        lane.status === "At Risk" && "bg-warning-muted text-warning-foreground",
                        lane.status === "Watching" && "bg-accent text-primary",
                      )}
                    >
                      {lane.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          { title: "Supplier Confirmation", text: `Capacity lock supports ${incident.affectedChipFamily} recovery through ${recoveryPlan.revisedEta}.`, icon: ShieldCheck },
          { title: "Logistics Readiness", text: `${recoveryPlan.shortTitle} is reserved for priority shipments.`, icon: Truck },
          { title: "Customer Transparency", text: `Customer Team has ${customerOrders.filter((order) => !["Notified", "Sent"].includes(order.communication)).length} order updates pending approval.`, icon: MessageSquare },
        ].map((item) => {
          const Icon = item.icon
          return (
              <Card key={item.title} className="p-4">
                <Icon className="size-8 rounded-lg bg-accent p-1.5 text-primary" />
              <h3 className="mt-3 text-sm font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
