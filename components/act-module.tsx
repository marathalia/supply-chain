"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  Clock,
  FileText,
  MessageSquare,
  Package,
  Send,
  Truck,
  Users,
  Zap,
} from "lucide-react"
import {
  activeIncident,
  getCustomerOrders,
  getRecoveryPlaybook,
  selectedRecoveryPlan,
  type RecoveryPlan,
  type ScenarioIncident,
} from "@/lib/workflow-data"

const defaultKpis = [
  { label: "Affected Orders", value: activeIncident.totalImpactedOrders.toLocaleString(), icon: Package, tone: "bg-warning-muted text-warning-foreground" },
  { label: "Impacted Customers", value: activeIncident.impactedCustomers.toString(), icon: Users, tone: "bg-secondary text-primary" },
  { label: "Teams Activated", value: "5/5", icon: CheckCircle2, tone: "bg-accent text-primary" },
  { label: "Recovery ETA", value: selectedRecoveryPlan.revisedEta, icon: Clock, tone: "bg-success-muted text-success" },
]

const playbookIcons = [Box, Zap, Truck, Users, MessageSquare]

const toneMap: Record<string, string> = {
  primary: "bg-accent text-primary",
  warning: "bg-warning-muted text-warning-foreground",
  muted: "bg-secondary text-muted-foreground",
}

const communicationFlow = ["Draft", "Pending Approval", "Sent", "Acknowledged"] as const
type CommunicationStatus = (typeof communicationFlow)[number]
const taskFlow = ["Pending", "Due Today", "In Progress", "Pending Approval", "Done"] as const
type TaskStatus = (typeof taskFlow)[number]

const statusTone: Record<string, string> = {
  Draft: "bg-secondary text-muted-foreground",
  "Pending Approval": "bg-warning-muted text-warning-foreground",
  Sent: "bg-accent text-primary",
  Acknowledged: "bg-success-muted text-success",
  "In Progress": "bg-accent text-primary",
  "Due Today": "bg-warning-muted text-warning-foreground",
  Pending: "bg-slate-100 text-slate-700",
  Notified: "bg-success-muted text-success",
  Done: "bg-success-muted text-success",
}

function Card({ children, className }: React.ComponentProps<"section">) {
  return <section className={cn("rounded-md border border-border bg-card shadow-sm", className)}>{children}</section>
}

function StepBadge({ step }: { step: number }) {
  return <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">{step}</span>
}

function Header({ step, title, action }: { step: number; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
      <div className="flex items-center gap-2">
        <StepBadge step={step} />
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
        statusTone[status] ?? "bg-secondary text-muted-foreground",
      )}
    >
      {status}
    </span>
  )
}

export function ActModule({
  incident = activeIncident,
  recoveryPlan = selectedRecoveryPlan,
}: {
  incident?: ScenarioIncident
  recoveryPlan?: RecoveryPlan
}) {
  const [previewVisible, setPreviewVisible] = useState(true)
  const [view, setView] = useState<"internal" | "external">("internal")
  const [selectedOrderId, setSelectedOrderId] = useState("PO-55871")
  const [ownershipReviewed, setOwnershipReviewed] = useState(false)
  const [communicationFilter, setCommunicationFilter] = useState<CommunicationStatus | "All">("All")
  const kpis = [
    { ...defaultKpis[0], value: incident.totalImpactedOrders.toLocaleString() },
    { ...defaultKpis[1], value: incident.impactedCustomers.toString() },
    defaultKpis[2],
    { ...defaultKpis[3], value: recoveryPlan.revisedEta },
  ]
  const playbook = getRecoveryPlaybook(incident, recoveryPlan).map((item, index) => ({ ...item, icon: playbookIcons[index] }))
  const orders = getCustomerOrders(incident, recoveryPlan)
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus>>(
    () => Object.fromEntries(playbook.map((item) => [item.code, item.status as TaskStatus])),
  )
  const [communicationStatuses, setCommunicationStatuses] = useState<Record<string, CommunicationStatus>>(
    () => Object.fromEntries(orders.map((order) => [order.id, order.communication as CommunicationStatus])),
  )
  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? orders[0]
  const selectedStatus = communicationStatuses[selectedOrder.id] ?? "Draft"
  const setOrderStatus = (orderId: string, status: CommunicationStatus) => {
    setCommunicationStatuses((current) => ({ ...current, [orderId]: status }))
  }
  const moveSelectedForward = () => {
    const index = communicationFlow.indexOf(selectedStatus)
    const next = communicationFlow[Math.min(index + 1, communicationFlow.length - 1)]
    setOrderStatus(selectedOrder.id, next)
  }
  const moveTaskForward = (code: string) => {
    const current = taskStatuses[code] ?? "Pending"
    const index = taskFlow.indexOf(current)
    const next = taskFlow[Math.min(index + 1, taskFlow.length - 1)]
    setTaskStatuses((state) => ({ ...state, [code]: next }))
  }
  const applyCommunicationFilter = (status: CommunicationStatus) => {
    const nextFilter = communicationFilter === status ? "All" : status
    setCommunicationFilter(nextFilter)
    const firstMatch = orders.find((order) => nextFilter === "All" || (communicationStatuses[order.id] ?? order.communication) === nextFilter)
    if (firstMatch) setSelectedOrderId(firstMatch.id)
  }
  const statusCounts = communicationFlow.map((status) => ({
    status,
    count: orders.filter((order) => (communicationStatuses[order.id] ?? order.communication) === status).length,
  }))
  const filteredOrders = orders.filter((order) => communicationFilter === "All" || (communicationStatuses[order.id] ?? order.communication) === communicationFilter)
  const completedTasks = playbook.filter((item) => (taskStatuses[item.code] ?? item.status) === "Done").length

  useEffect(() => {
    setSelectedOrderId(orders[0]?.id ?? "PO-55871")
    setCommunicationStatuses(Object.fromEntries(orders.map((order) => [order.id, order.communication as CommunicationStatus])))
    setTaskStatuses(Object.fromEntries(playbook.map((item) => [item.code, item.status as TaskStatus])))
    setCommunicationFilter("All")
    setOwnershipReviewed(false)
  }, [incident.id])

  return (
    <div className="space-y-4 bg-background">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Act: Recovery Execution and Communications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Coordinate internal response, approvals, and customer updates for the active incident</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className={cn("rounded-md p-4", kpi.tone)}>
              <div className="flex items-center gap-3">
                <Icon className="size-5" />
                <div>
                  <p className="text-xs font-semibold opacity-80">{kpi.label}</p>
                  <p className="text-2xl font-bold tabular-nums">{kpi.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-1.5 shadow-sm">
        <div className="flex rounded-md bg-secondary p-1">
          {[
            { id: "internal" as const, label: "Internal Comms", icon: Users },
            { id: "external" as const, label: "External Comms", icon: MessageSquare },
          ].map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition",
                  view === item.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            )
          })}
        </div>
        <p className="px-3 text-xs font-semibold text-muted-foreground">
          Active incident: <span className="text-foreground">{incident.type}</span>
          {view === "internal" && <span className="ml-3 text-primary">{completedTasks}/{playbook.length} tasks done</span>}
          {view === "external" && <span className="ml-3 text-primary">Filter: {communicationFilter}</span>}
        </p>
      </div>

      {view === "internal" && (
        <>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
        <Card>
          <Header
            step={1}
            title="Selected Recovery Plan"
            action={<span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">{recoveryPlan.status}</span>}
          />
            <div className="grid gap-5 p-4 md:grid-cols-2">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Recommended route</dt>
                <dd className="mt-1 font-bold text-foreground">{recoveryPlan.title}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Affected products</dt>
                <dd className="mt-1 font-bold text-foreground">{incident.affectedProducts.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Revised delivery</dt>
                <dd className="mt-1 font-bold text-foreground">{recoveryPlan.revisedEta} ({recoveryPlan.etaDelta})</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Escalation path</dt>
                <dd className="mt-1 font-bold text-foreground">{recoveryPlan.escalationLevel}</dd>
              </div>
            </dl>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Impacted customers</dt>
                <dd className="mt-1 font-bold text-foreground">{incident.impactedCustomers}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-muted-foreground">Owner</dt>
                <dd className="mt-1 font-bold text-foreground">{incident.owner}</dd>
              </div>
            </dl>
          </div>
        </Card>

        <Card>
          <Header
            step={2}
            title="Incident Ownership"
            action={<StatusPill status={ownershipReviewed ? "Done" : "Pending Approval"} />}
          />
          <div className="space-y-3 p-4">
            <div className="rounded-md border border-primary/25 bg-accent/35 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-primary">Current owner</p>
              <p className="mt-2 text-lg font-bold text-foreground">{recoveryPlan.escalationLevel}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Coordinates {incident.owner}, Production, Logistics, Sales, and Customer Team until the recovery plan is stable.
              </p>
            </div>
            <div className="grid gap-3 text-xs md:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-md border border-border p-3">
                <p className="font-bold text-foreground">Decision gate</p>
                <p className="mt-1 leading-5 text-muted-foreground">
                  Escalate if route capacity, production resequencing, or customer approvals are not confirmed by {recoveryPlan.nextUpdate}.
                </p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="font-bold text-foreground">Next escalation</p>
                <p className="mt-1 text-muted-foreground">APAC Leadership with commercial risk summary and customer SLA exposure.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOwnershipReviewed((value) => !value)}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-xs font-bold transition",
                ownershipReviewed ? "bg-success-muted text-success" : "bg-primary text-white hover:bg-primary/90",
              )}
            >
              <CheckCircle2 className="size-4" />
              {ownershipReviewed ? "Ownership reviewed" : "Mark ownership reviewed"}
            </button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <Header
            step={3}
            title="Execution Playbook"
            action={<span className="text-xs font-bold text-primary">Select a status to update each workstream</span>}
          />
          <div className="space-y-3 p-4">
            {playbook.map((item) => {
              const Icon = item.icon
              const currentStatus = taskStatuses[item.code] ?? item.status
              return (
                <div
                  key={item.team}
                  className="grid gap-3 rounded-md border border-border bg-muted/25 p-3 lg:grid-cols-[42px_minmax(0,1.45fr)_minmax(180px,0.75fr)_minmax(210px,0.9fr)] lg:items-center"
                >
                  <span className={cn("flex size-10 flex-col items-center justify-center rounded-md text-[9px] font-bold", toneMap[item.tone])}>
                    <Icon className="size-4" />
                    {item.code}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-foreground">{item.team}</p>
                      <span className="text-xs text-muted-foreground">due {item.time}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-foreground">{item.action}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.decision}</p>
                  </div>
                  <div className="rounded-md bg-card p-3 text-xs">
                    <p className="font-bold text-foreground">Output</p>
                    <p className="mt-1 leading-5 text-muted-foreground">{item.output}</p>
                    <p className="mt-2 inline-flex items-center gap-1 font-semibold text-warning-foreground">
                      <AlertTriangle className="size-3.5" />
                      Depends on {item.dependency}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <StatusPill status={currentStatus} />
                      <button
                        type="button"
                        onClick={() => moveTaskForward(item.code)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Advance
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {taskFlow.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setTaskStatuses((state) => ({ ...state, [item.code]: status }))}
                          className={cn(
                            "rounded-full border px-2 py-1 text-[10px] font-bold transition",
                            currentStatus === status
                              ? "border-primary bg-accent text-primary"
                              : "border-border bg-card text-muted-foreground hover:bg-secondary",
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
        </>
      )}

      {view === "external" && (
        <>
      <Card>
        <Header
          step={1}
          title="External Customer Communication Queue"
          action={<span className="text-xs text-muted-foreground">{orders.length} orders tracked</span>}
        />
        <div className="grid gap-3 border-b border-border p-4 md:grid-cols-4">
          {statusCounts.map((item) => (
            <button
              key={item.status}
              type="button"
              onClick={() => applyCommunicationFilter(item.status)}
              className={cn(
                "rounded-md border p-3 text-left transition hover:bg-secondary/60",
                communicationFilter === item.status ? "border-primary bg-accent" : "border-border",
              )}
            >
              <StatusPill status={item.status} />
              <p className="mt-3 text-3xl font-bold tabular-nums text-foreground">{item.count}</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">customer updates</p>
            </button>
          ))}
        </div>
        <div className="p-4">
          <table className="w-full table-fixed text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="w-[11%] px-4 py-3 font-bold">Order ID</th>
                <th className="w-[17%] px-4 py-3 font-bold">Customer</th>
                <th className="w-[22%] px-4 py-3 font-bold">Reason</th>
                <th className="w-[14%] px-4 py-3 font-bold">Revised ETA</th>
                <th className="w-[22%] px-4 py-3 font-bold">Recovery action</th>
                <th className="w-[14%] px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={cn(
                    "cursor-pointer border-b border-border last:border-b-0 hover:bg-secondary/50",
                    order.id === selectedOrder.id && "bg-accent/35",
                  )}
                >
                  <td className="px-4 py-3 font-bold text-foreground">{order.id}</td>
                  <td className="px-4 py-3 text-foreground">{order.customer}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.reason}</td>
                  <td className="px-4 py-3 text-foreground">{order.eta}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.action}</td>
                  <td className="px-4 py-3"><StatusPill status={communicationStatuses[order.id] ?? order.communication} /></td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm font-semibold text-muted-foreground">
                    No customer updates in this status.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <Header
          step={2}
          title={`Generated Message - ${selectedOrder.customer} (${selectedOrder.id})`}
          action={
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setPreviewVisible((visible) => !visible)} className="text-xs font-bold text-primary">
                {previewVisible ? "Hide preview" : "Show preview"}
              </button>
              <button
                type="button"
                onClick={moveSelectedForward}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90"
              >
                <Send className="size-3.5" />
                {selectedStatus === "Acknowledged"
                  ? "Acknowledged"
                  : `Move to ${communicationFlow[Math.min(communicationFlow.indexOf(selectedStatus) + 1, communicationFlow.length - 1)]}`}
              </button>
            </div>
          }
        />
        {previewVisible && (
          <div className="p-4">
            <div className="mb-5 grid gap-3 md:grid-cols-4">
              {communicationFlow.map((status, index) => {
                const active = communicationFlow.indexOf(selectedStatus) >= index
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setOrderStatus(selectedOrder.id, status)}
                    className={cn(
                      "rounded-md border p-3 text-left transition",
                      active ? "border-primary/30 bg-accent text-primary" : "border-border bg-card text-muted-foreground",
                    )}
                  >
                    <span className="flex size-6 items-center justify-center rounded-full border border-current text-xs font-bold">{index + 1}</span>
                    <p className="mt-2 text-xs font-bold">{status}</p>
                  </button>
                )
              })}
            </div>
            <div className="rounded-md border border-border bg-muted/20 p-4 text-sm text-foreground">
              <div className="flex flex-wrap gap-8 border-b border-border pb-4 text-xs text-muted-foreground">
                <span>To: procurement@{selectedOrder.customer.toLowerCase().replaceAll(" ", "-")}.com</span>
                <span>Re: Order {selectedOrder.id} - Disruption Update</span>
                <StatusPill status={selectedStatus} />
              </div>
              <div className="mt-4 flex items-start gap-3 rounded-md border border-primary/20 bg-accent/30 p-3">
                <FileText className="mt-0.5 size-5 text-primary" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">AI-generated customer message</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Generated from the active incident, selected recovery plan, customer order ID, and revised ETA. Review required before external send.
                  </p>
                </div>
              </div>
              <p className="mt-4">Dear {selectedOrder.customer} Team,</p>
              <p className="mt-4 leading-relaxed">
                We are writing to inform you of a supply disruption affecting order <strong>{selectedOrder.id}</strong> due to {incident.type.toLowerCase()}: {incident.scenario}. We have immediately activated our resilience protocols to minimise the impact on your operations.
              </p>
              <div className="mt-4 rounded-md border border-border bg-card p-3">
                <p><strong>Reason for delay:</strong> {incident.type} ({incident.location})</p>
                <p><strong>Revised estimated delivery date:</strong> {selectedOrder.eta} ({recoveryPlan.etaDelta})</p>
                <p><strong>Recovery action:</strong> {selectedOrder.action}</p>
                <p><strong>Next update:</strong> {recoveryPlan.nextUpdate}</p>
              </div>
              <p className="mt-4">We apologise for any inconvenience and appreciate your continued partnership. Our team remains fully committed to minimising disruption to your supply.</p>
              <p className="mt-4">Yours sincerely,<br /><strong>Infineon Supply Chain Operations</strong></p>
            </div>
          </div>
        )}
      </Card>
        </>
      )}
    </div>
  )
}
