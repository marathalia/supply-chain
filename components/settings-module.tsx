"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Bell,
  Check,
  CircleHelp,
  Database,
  Globe2,
  KeyRound,
  Lock,
  Mail,
  RefreshCcw,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react"

const tabs = ["General", "Data Sources", "Notifications", "Access"]

const sources = [
  { name: "ERP Orders", owner: "SAP S/4HANA", status: "Connected", sync: "3 min ago" },
  { name: "Logistics Telemetry", owner: "Cargo + port feeds", status: "Connected", sync: "8 min ago" },
  { name: "Risk Intelligence", owner: "GeoIntel + trade feeds", status: "Connected", sync: "12 min ago" },
  { name: "Customer CRM", owner: "Salesforce", status: "Needs review", sync: "1 hr ago" },
]

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

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn("relative h-6 w-11 rounded-full transition", checked ? "bg-primary" : "bg-secondary")}
      aria-pressed={checked}
    >
      <span className={cn("absolute top-1 size-4 rounded-full bg-white transition", checked ? "left-6" : "left-1")} />
    </button>
  )
}

export function SettingsModule() {
  const [tab, setTab] = useState("General")
  const [autoSync, setAutoSync] = useState(true)
  const [alerts, setAlerts] = useState(true)
  const [approval, setApproval] = useState(false)

  return (
    <div className="space-y-4 pb-8">
      <Card className="p-1.5">
        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={cn("rounded-md px-4 py-2 text-sm font-bold", tab === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary")}
            >
              {item}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <Card>
          <Header title="Workspace Configuration" />
          <div className="space-y-3 p-4">
            {[
              { label: "Command centre name", value: "ChainGuard Resilience Command", icon: ShieldCheck },
              { label: "Region", value: "Infineon EMEA + APAC", icon: Globe2 },
              { label: "Default time horizon", value: "30 days", icon: SlidersHorizontal },
            ].map((item) => {
              const Icon = item.icon
              return (
                <label key={item.label} className="block rounded-md border border-border p-3">
                  <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Icon className="size-4" />
                    {item.label}
                  </span>
                  <input className="mt-3 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground outline-none focus:border-primary" defaultValue={item.value} />
                </label>
              )
            })}
          </div>
        </Card>

        <Card>
          <Header title="Operational Controls" action={<button className="text-xs font-bold text-primary">Save changes</button>} />
          <div className="divide-y divide-border px-4">
            {[
              { label: "Auto-sync data feeds", desc: "Refresh supply, order, logistics and risk feeds automatically.", value: autoSync, set: () => setAutoSync((v) => !v), icon: RefreshCcw },
              { label: "High-risk alert notifications", desc: "Notify operations when risk crosses configured thresholds.", value: alerts, set: () => setAlerts((v) => !v), icon: Bell },
              { label: "Require approval before customer send", desc: "Route generated customer messages through manager approval.", value: approval, set: () => setApproval((v) => !v), icon: Mail },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex items-center justify-between gap-4 py-4">
                  <div className="flex gap-3">
                    <Icon className="mt-0.5 size-5 text-primary" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Toggle checked={item.value} onChange={item.set} />
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <Card>
        <Header title="Data Sources" action={<button className="rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Add source</button>} />
        <div className="p-4">
          <table className="w-full table-fixed text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="w-[28%] px-3 py-3 font-bold">Source</th>
                <th className="w-[28%] px-3 py-3 font-bold">Owner</th>
                <th className="w-[22%] px-3 py-3 font-bold">Status</th>
                <th className="w-[22%] px-3 py-3 font-bold">Last Sync</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((source) => (
                <tr key={source.name} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-4">
                    <span className="inline-flex size-8 items-center justify-center rounded-lg bg-accent text-primary">
                      <Database className="size-4" />
                    </span>
                    <span className="ml-3 font-bold text-foreground">{source.name}</span>
                  </td>
                  <td className="px-3 py-4 text-muted-foreground">{source.owner}</td>
                  <td className="px-3 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                        source.status === "Connected" ? "bg-success-muted text-success" : "bg-warning-muted text-warning-foreground",
                      )}
                    >
                      {source.status === "Connected" && <Check className="size-3" />}
                      {source.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-muted-foreground">{source.sync}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {[
          { title: "Role Groups", value: "6 active", icon: Users, text: "Operations, regional ops, production, logistics, sales and leadership." },
          { title: "Security", value: "SSO enabled", icon: Lock, text: "Workspace access follows Infineon identity controls." },
          { title: "API Keys", value: "4 managed", icon: KeyRound, text: "Keys are scoped to telemetry, ERP, CRM and risk intelligence." },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title} className="p-4">
              <Icon className="size-8 rounded-lg bg-secondary p-1.5 text-muted-foreground" />
              <p className="mt-3 text-sm font-bold text-foreground">{item.title}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{item.value}</p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.text}</p>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
