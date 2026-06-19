"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type { ModuleKey } from "@/components/sidebar"
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  DatabaseZap,
  MessageSquareText,
  Send,
  Sparkles,
} from "lucide-react"
import { activeIncident, selectedRecoveryPlan, type RecoveryPlan, type ScenarioIncident } from "@/lib/workflow-data"

type Message = {
  id: number
  role: "agent" | "user"
  text: string
}

const contextByModule: Record<ModuleKey, { label: string; summary: string; prompts: string[] }> = {
  overview: {
    label: "Overview",
    summary: "Network status, executive KPIs, active alerts, chip family health, and impacted orders.",
    prompts: ["Summarise current network risk", "Which chip family needs attention?", "Draft executive update"],
  },
  see: {
    label: "See",
    summary: "Live supply map, risk signals, delay impact by chip family, downstream consequences, and affected customers.",
    prompts: ["Explain what is happening on the map", "Find highest-risk route", "What changed in the last 24 hours?"],
  },
  decide: {
    label: "Decide",
    summary: "Scenario simulation, recovery options, Adaptive CHAIN score, trade-off analysis, and option recommendation.",
    prompts: ["Why is Option 2 recommended?", "Compare Option 1 and Option 2", "What if cost matters more?"],
  },
  act: {
    label: "Act",
    summary: "Recovery plan execution, escalation path, playbook tasks, order updates, and customer message preview.",
    prompts: ["Draft customer message", "What tasks are overdue?", "Summarise recovery plan"],
  },
  monitor: {
    label: "Monitor",
    summary: "Recovery progress, SLA watchlist, live monitor feed, recovery lanes, and post-action status.",
    prompts: ["Are we back on track?", "Which lane is at risk?", "Prepare checkpoint notes"],
  },
  settings: {
    label: "Settings",
    summary: "Workspace configuration, data sources, notification rules, access settings, and API controls.",
    prompts: ["Check data source health", "Recommend alert settings", "Explain access controls"],
  },
}

function buildAgentResponse(active: ModuleKey, prompt: string, incident: ScenarioIncident, recoveryPlan: RecoveryPlan) {
  const context = contextByModule[active]
  const lower = prompt.toLowerCase()

  if (lower.includes("draft") || lower.includes("message") || lower.includes("customer")) {
    return `Using ${context.label} context, I would draft a customer-safe update for ${incident.type.toLowerCase()}: revised ETA ${recoveryPlan.revisedEta}, recovery action ${recoveryPlan.title}, next update ${recoveryPlan.nextUpdate}. Suggested tone: calm, specific, and accountable.`
  }

  if (lower.includes("option") || lower.includes("recommend")) {
    return `${recoveryPlan.optionId} is the strongest recommendation for ${incident.scenario} because it balances recovery speed, cost, risk exposure, and feasibility. Expected recovery shift is ${recoveryPlan.etaDelta}.`
  }

  if (lower.includes("risk") || lower.includes("route") || lower.includes("map")) {
    return `The active operational attention is on ${incident.affectedChipFamily}, with ${incident.affectedOrders.toLocaleString()} orders directly exposed and ${incident.totalImpactedOrders.toLocaleString()} total impacted orders across the network. The route response is ${recoveryPlan.title}.`
  }

  if (lower.includes("track") || lower.includes("lane") || lower.includes("sla")) {
    return "Recovery is progressing, but the SLA watchlist still needs daily monitoring. The safest next move is to confirm logistics capacity, refresh customer ETAs, and watch any route with amber status."
  }

  return `I am using the ${context.label} page context for incident ${incident.id}: ${incident.scenario}. ${context.summary} Ask me for a risk summary, recommended action, customer update, or a what-if analysis.`
}

export function AIAgentPanel({
  active,
  open,
  onOpenChange,
  incident = activeIncident,
  recoveryPlan = selectedRecoveryPlan,
}: {
  active: ModuleKey
  open: boolean
  onOpenChange: (open: boolean) => void
  incident?: ScenarioIncident
  recoveryPlan?: RecoveryPlan
}) {
  const [input, setInput] = useState("")
  const context = contextByModule[active]
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "agent",
      text: "Hi, I am your supply-chain AI agent. I can explain risks, compare recovery options, draft updates, and answer questions using the current dashboard context.",
    },
  ])
  const [useContext, setUseContext] = useState(true)

  const statusText = useMemo(() => (useContext ? `${context.label} context attached` : "General mode"), [context.label, useContext])

  const sendPrompt = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const nextUser: Message = { id: Date.now(), role: "user", text: trimmed }
    const nextAgent: Message = {
      id: Date.now() + 1,
      role: "agent",
      text: useContext ? buildAgentResponse(active, trimmed, incident, recoveryPlan) : "I can answer generally, but page context is off. Turn it on for dashboard-specific recommendations.",
    }
    setMessages((current) => [...current, nextUser, nextAgent])
    setInput("")
  }

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(true)}
        className={cn(
          "fixed bottom-5 z-50 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90",
          open ? "right-[382px]" : "right-5",
        )}
        aria-label={open ? "AI agent is open" : "Open AI agent"}
      >
        <Sparkles className="size-4" />
        Ask AI
      </button>

      {open && (
          <aside className="fixed inset-y-0 right-0 z-40 flex h-full w-[360px] flex-col border-l border-border bg-[#101418] text-white shadow-2xl">
            <header className="border-b border-white/10 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Bot className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">Signal AI Agent</p>
                    <p className="mt-1 text-xs text-white/60">Always-on assistant for this dashboard</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-md p-2 text-white/60 hover:bg-white/10 hover:text-white"
                  aria-label="Collapse AI agent"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </header>

            <div className="border-b border-white/10 p-5">
              <div className="rounded-md border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-start gap-3">
                  <DatabaseZap className="mt-0.5 size-5 text-teal-300" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-white/50">{statusText}</p>
                    <p className="mt-1 text-sm leading-6 text-white/82">{incident.scenario}</p>
                    <p className="mt-2 text-xs leading-5 text-white/50">{context.summary}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setUseContext((value) => !value)}
                  className={cn(
                    "mt-4 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-bold",
                    useContext
                      ? "border-teal-300/25 bg-teal-300/10 text-teal-200"
                      : "border-white/10 bg-transparent text-white/55",
                  )}
                >
                  <CheckCircle2 className="size-4" />
                  Use dashboard context
                </button>
              </div>

              <div className="mt-4 grid gap-2">
                {context.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendPrompt(prompt)}
                    className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-left text-sm font-semibold text-white/85 hover:bg-white/[0.08]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-5">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[88%] rounded-md px-4 py-3 text-sm leading-6",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "border border-white/10 bg-white/[0.06] text-white/86",
                    )}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            <form
              className="border-t border-white/10 p-4"
              onSubmit={(event) => {
                event.preventDefault()
                sendPrompt(input)
              }}
            >
              <div className="rounded-md border border-white/10 bg-black/20 p-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={`Ask about ${context.label.toLowerCase()}...`}
                  className="min-h-20 w-full resize-none bg-transparent px-2 py-2 text-sm text-white outline-none placeholder:text-white/35"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/45">
                    <MessageSquareText className="size-4" />
                    Prototype response engine
                  </span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
                  >
                    <Send className="size-3.5" />
                    Send
                  </button>
                </div>
              </div>
              <p className="mt-2 text-[11px] leading-5 text-white/40">
                Later this panel can connect to an LLM API/RAG service for live dashboard reasoning.
              </p>
            </form>
          </aside>
      )}
    </>
  )
}
