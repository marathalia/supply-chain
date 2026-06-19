"use client"

import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Euro,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Trophy,
  Users,
  Workflow,
} from "lucide-react"
import {
  buildIncidentFromPrompt,
  calculateRouteScore,
  getRecoveryPlan,
  scenarioPresets,
  type ScenarioIncident,
} from "@/lib/workflow-data"

type OptionId = "Option 1" | "Option 2" | "Option 3" | "Option 4" | "Option 5" | "Custom"
type RecoveryOption = {
  id: OptionId
  rank: number
  desc: string
  type: string
  score: number
  cost: string
  costValue: string
  lead: string
  risk: string
  tone: string
  dims: readonly number[]
  reason: string
}

const horizons = ["14 Days", "30 Days", "60 Days"] as const

type AIBreakdown = {
  scenario: string
  type: string
  supplier: string
  location: string
  duration: string
  affectedProducts: string
  affectedOrders: string
  customersImpacted: string
  atRiskValue: string
  delayRisk: string
  rationale: string
}

function incidentToBreakdown(incident: ScenarioIncident): AIBreakdown {
  return {
    scenario: incident.scenario,
    type: incident.type,
    supplier: incident.supplier,
    location: incident.location,
    duration: incident.duration,
    affectedProducts: incident.affectedProducts.length.toString(),
    affectedOrders: incident.affectedOrders.toLocaleString(),
    customersImpacted: incident.impactedCustomers.toString(),
    atRiskValue: incident.atRiskValue,
    delayRisk: incident.delayWithoutAction,
    rationale: incident.recommendedAction,
  }
}

function generateAIBreakdown(text: string, horizon: string): AIBreakdown {
  return incidentToBreakdown(buildIncidentFromPrompt(text, horizon))
}

const dimensions = [
  { key: "C", label: "Cost Efficiency", color: "bg-accent text-primary" },
  { key: "H", label: "Handling & Supplier Capability", color: "bg-accent text-primary" },
  { key: "A", label: "Agility & Lead Time", color: "bg-secondary text-muted-foreground" },
  { key: "I", label: "Impact Risk", color: "bg-warning-muted text-warning-foreground" },
  { key: "N", label: "Network Recovery Feasibility", color: "bg-success-muted text-success" },
] as const

function getRecoveryOptions(plan: ReturnType<typeof getRecoveryPlan>): RecoveryOption[] {
  return [
  {
    id: "Option 2",
    rank: 1,
    desc: plan.shortTitle,
    type: "Partial Rerouting",
    score: calculateRouteScore({ cost: 85, leadTime: 80, supplierCapability: 80, riskReduction: 75, feasibility: 90 }),
    cost: "+8%",
    costValue: "EUR1.02M",
    lead: "+3 Days",
    risk: "EUR4.3M",
    tone: "teal",
    dims: [85, 80, 80, 75, 90],
    reason: plan.reason,
  },
  {
    id: "Option 1",
    rank: 2,
    desc: "Full Rerouting via S2",
    type: "Full Rerouting",
    score: 76,
    cost: "+14%",
    costValue: "EUR1.78M",
    lead: "+1 Day",
    risk: "EUR6.1M",
    tone: "blue",
    dims: [70, 88, 95, 55, 72],
    reason: "Fastest response, but higher cost and exposure.",
  },
  {
    id: "Option 3",
    rank: 3,
    desc: "Alternative Supplier S4",
    type: "Alt. Supplier",
    score: 65,
    cost: "+18%",
    costValue: "EUR2.21M",
    lead: "+6 Days",
    risk: "EUR7.8M",
    tone: "purple",
    dims: [55, 62, 68, 66, 74],
    reason: "Useful fallback, but supplier qualification adds risk.",
  },
  {
    id: "Option 4",
    rank: 4,
    desc: "Inventory Reallocation",
    type: "Inventory Move",
    score: 58,
    cost: "+5%",
    costValue: "EUR0.61M",
    lead: "+7 Days",
    risk: "EUR5.2M",
    tone: "orange",
    dims: [82, 48, 42, 58, 60],
    reason: "Low cost, but slower recovery and limited inventory.",
  },
  {
    id: "Option 5",
    rank: 5,
    desc: "Production Rescheduling",
    type: "Rescheduling",
    score: 41,
    cost: "+2%",
    costValue: "EUR0.23M",
    lead: "+14 Days",
    risk: "EUR10.9M",
    tone: "amber",
    dims: [90, 35, 25, 20, 35],
    reason: "Cheapest option, but delay risk remains high.",
  },
  ]
}

const recommendationsByOption: Record<OptionId, string[]> = {
  "Option 2": [
    "Lower cost impact compared to full rerouting and alternative supplier.",
    "Shorter lead time than inventory move and production rescheduling.",
    "High supplier capability with available capacity in S2 and S3.",
    "Moderate risk exposure with diversified routes.",
    "High feasibility due to existing contracts and logistics readiness.",
  ],
  "Option 1": [
    "Fastest lead time recovery among available options.",
    "Best fit when delivery SLA is more important than cost.",
    "Uses existing S2 logistics lane with available capacity.",
  ],
  "Option 3": [
    "Adds supplier redundancy if S1 remains unavailable.",
    "Moderate lead time improvement versus waiting for recovery.",
    "Requires qualification checks before execution.",
  ],
  "Option 4": [
    "Lowest operational complexity among physical rerouting options.",
    "Keeps supplier footprint stable.",
    "Works best when customer demand can absorb a longer delay.",
  ],
  "Option 5": [
    "Lowest direct cost impact.",
    "Preserves logistics capacity for higher-priority orders.",
    "Only recommended when service impact is acceptable.",
  ],
  Custom: [
    "Custom option is ready for manual tuning.",
    "Adjust weights and compare against the ranked recovery set.",
  ],
}

const toneClasses: Record<string, { text: string; bg: string; bar: string; border: string }> = {
  teal: { text: "text-primary", bg: "bg-accent", bar: "bg-primary", border: "border-primary/30" },
  blue: { text: "text-primary", bg: "bg-accent", bar: "bg-primary", border: "border-primary/30" },
  purple: { text: "text-muted-foreground", bg: "bg-secondary", bar: "bg-muted-foreground", border: "border-border" },
  orange: { text: "text-warning-foreground", bg: "bg-warning-muted", bar: "bg-warning", border: "border-warning/30" },
  amber: { text: "text-warning-foreground", bg: "bg-warning-muted", bar: "bg-warning", border: "border-warning/30" },
}

function Card({ children, className, ...props }: React.ComponentProps<"section">) {
  return <section className={cn("rounded-md border border-border bg-card shadow-sm", className)} {...props}>{children}</section>
}

function SectionTitle({ icon: Icon, title, danger }: { icon?: typeof Trophy; title: string; danger?: boolean }) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
      {Icon && <Icon className={cn("size-[18px]", danger ? "text-danger" : "text-primary")} />}
      <h2 className={cn("text-sm font-bold", danger ? "text-danger" : "text-primary")}>{title}</h2>
    </div>
  )
}

function TradeoffChart({ selectedId, onSelect }: { selectedId: OptionId; onSelect: (id: OptionId) => void }) {
  const dots = [
    { id: "Option 1" as OptionId, x: 63, y: 62, size: 11, color: "bg-primary" },
    { id: "Option 2" as OptionId, x: 40, y: 52, size: 10, color: "bg-primary" },
    { id: "Option 3" as OptionId, x: 74, y: 45, size: 10, color: "bg-muted-foreground" },
    { id: "Option 4" as OptionId, x: 34, y: 34, size: 10, color: "bg-warning" },
    { id: "Option 5" as OptionId, x: 70, y: 18, size: 10, color: "bg-warning" },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_130px]">
      <div className="relative h-72 rounded-md border border-border bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:25%_25%]">
        <div className="absolute bottom-7 left-12 right-8 h-px bg-border" />
        <div className="absolute bottom-7 left-12 top-6 w-px bg-border" />
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs font-semibold text-muted-foreground">Cost Impact (%)</span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold text-muted-foreground">Lead Time Impact (Days)</span>
        {dots.map((dot) => (
          <button
            key={dot.id}
            type="button"
            onClick={() => onSelect(dot.id)}
            className="absolute flex items-center gap-2 rounded-md p-1"
            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
          >
            <span
              className={cn(
                "block rounded-full border-2 border-white/70 opacity-80 shadow-md",
                dot.color,
                selectedId === dot.id && "ring-2 ring-primary ring-offset-2",
              )}
              style={{ width: dot.size * 2, height: dot.size * 2 }}
            />
            <span className="whitespace-nowrap text-xs font-bold text-foreground">{dot.id}</span>
          </button>
        ))}
      </div>
      <div className="self-center rounded-md border border-border bg-card p-3 text-xs">
        <p className="font-bold text-foreground">Impact Risk</p>
        <p className="text-muted-foreground">(Bubble Size)</p>
        <div className="mt-3 space-y-2">
          <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-danger" />High</span>
          <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-warning" />Medium</span>
          <span className="flex items-center gap-2"><span className="size-3 rounded-full bg-success" />Low</span>
        </div>
      </div>
    </div>
  )
}

export function DecideModule({
  incident,
  onIncidentChange,
}: {
  incident: ScenarioIncident
  onIncidentChange: (incident: ScenarioIncident) => void
}) {
  const [scenarioDraft, setScenarioDraft] = useState(incident.scenario)
  const [selectedPresetId, setSelectedPresetId] = useState(incident.id)
  const [presetOpen, setPresetOpen] = useState(false)
  const [breakdown, setBreakdown] = useState<AIBreakdown>(incidentToBreakdown(incident))
  const [horizon, setHorizon] = useState<(typeof horizons)[number]>(horizons[1])
  const [horizonOpen, setHorizonOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<OptionId>("Option 2")
  const [weights, setWeights] = useState([20, 20, 20, 20, 20])
  const [simulationState, setSimulationState] = useState<"idle" | "running" | "complete">("idle")
  const [customBuilderOpen, setCustomBuilderOpen] = useState(false)
  const [customOption, setCustomOption] = useState<RecoveryOption | null>(null)

  const plan = getRecoveryPlan(buildIncidentFromPrompt(scenarioDraft, horizon))
  const recoveryOptions = useMemo(() => {
    const base = getRecoveryOptions(plan)
    return customOption ? [...base, customOption] : base
  }, [plan, customOption])
  const selectedOption = recoveryOptions.find((option) => option.id === selectedId) ?? recoveryOptions[0]
  const generatedImpactMetrics = [
    { label: "Affected Products", value: breakdown.affectedProducts, icon: Sparkles },
    { label: "Affected Orders", value: breakdown.affectedOrders, icon: Workflow },
    { label: "Customers Impacted", value: breakdown.customersImpacted, icon: Users },
    { label: "At Risk Value", value: breakdown.atRiskValue, icon: Euro },
    { label: "Delay Risk (Avg.)", value: breakdown.delayRisk, icon: Clock, danger: true },
  ]
  const weightedScore = useMemo(
    () => Math.round(selectedOption.dims.reduce((sum, score, index) => sum + score * weights[index], 0) / 100),
    [selectedOption, weights],
  )
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)

  const chooseOption = (id: OptionId) => {
    setSelectedId(id)
    setSimulationState("idle")
  }

  const runSimulation = () => {
    setSimulationState("running")
    window.setTimeout(() => {
      const nextIncident = buildIncidentFromPrompt(scenarioDraft, horizon)
      const nextPlan = getRecoveryPlan(nextIncident)
      setBreakdown(generateAIBreakdown(scenarioDraft, horizon))
      setSelectedId(nextPlan.optionId as OptionId)
      onIncidentChange(nextIncident)
      setSimulationState("complete")
    }, 650)
  }

  const adjustWeight = (index: number, delta: number) => {
    setWeights((current) => current.map((weight, itemIndex) => itemIndex === index ? Math.min(40, Math.max(5, weight + delta)) : weight))
  }

  const normalizeWeights = () => {
    setWeights([20, 20, 20, 20, 20])
  }

  const createCustomOption = (mode: "balanced" | "fast" | "low-cost") => {
    const config = {
      balanced: {
        desc: "Hybrid split allocation via Singapore + EU buffer",
        type: "Hybrid Recovery",
        cost: "+10%",
        costValue: "EUR1.18M",
        lead: "+4 Days",
        risk: "EUR4.9M",
        dims: [82, 78, 84, 80, 86] as const,
        reason: "Combines rerouting, buffer inventory, and qualified logistics capacity for a balanced recovery.",
      },
      fast: {
        desc: "Emergency premium freight for top customers",
        type: "Expedite",
        cost: "+22%",
        costValue: "EUR2.62M",
        lead: "+1 Day",
        risk: "EUR5.8M",
        dims: [45, 76, 96, 72, 68] as const,
        reason: "Best when customer SLA protection is more important than direct logistics cost.",
      },
      "low-cost": {
        desc: "Inventory swap from EU hub with delayed low-priority builds",
        type: "Inventory Swap",
        cost: "+4%",
        costValue: "EUR0.48M",
        lead: "+8 Days",
        risk: "EUR6.5M",
        dims: [92, 58, 50, 64, 74] as const,
        reason: "Lowest cost custom path, but slower than rerouting and better for non-critical orders.",
      },
    }[mode]

    const score = Math.round(config.dims.reduce((sum, score, index) => sum + score * weights[index], 0) / 100)
    const next: RecoveryOption = {
      id: "Custom",
      rank: recoveryOptions.length + 1,
      tone: "teal",
      score,
      ...config,
    }
    setCustomOption(next)
    setSelectedId("Custom")
    setCustomBuilderOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Decide: Scenario Simulation and Route Optimisation</h1>
          <p className="mt-1 text-sm text-muted-foreground">Compare recovery options and select the best response</p>
        </div>
        <div className="grid w-full gap-3 rounded-md border border-border bg-card/55 p-3 shadow-sm lg:grid-cols-[minmax(220px,0.72fr)_minmax(460px,1.9fr)_minmax(136px,0.42fr)_minmax(170px,0.5fr)] lg:items-end">
          <label className="relative block">
            <span className="text-xs font-semibold text-muted-foreground">Scenario Template</span>
            <button
              type="button"
              onClick={() => setPresetOpen((open) => !open)}
              className="mt-1 flex h-14 w-full items-center justify-between rounded-md border border-border bg-card px-4 py-2 text-left text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/40"
            >
              <span className="truncate">{scenarioPresets.find((item) => item.id === selectedPresetId)?.type ?? "Custom Scenario"}</span>
              <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", presetOpen && "rotate-180")} />
            </button>
            {presetOpen && (
              <div className="absolute z-40 mt-2 max-h-80 w-[360px] overflow-y-auto rounded-md border border-border bg-card shadow-lg">
                {scenarioPresets.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(item.id)
                      setScenarioDraft(item.scenario)
                      setBreakdown(incidentToBreakdown(item))
                      setPresetOpen(false)
                      setSimulationState("idle")
                    }}
                    className={cn("block w-full px-4 py-3 text-left hover:bg-secondary", item.id === selectedPresetId && "bg-accent")}
                  >
                    <span className="block text-sm font-bold text-foreground">{item.type}</span>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.scenario}</span>
                  </button>
                ))}
              </div>
            )}
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-muted-foreground">Custom Scenario / AI Prompt</span>
            <textarea
              value={scenarioDraft}
              onChange={(event) => {
                setScenarioDraft(event.target.value)
                setSelectedPresetId("custom")
                setSimulationState("idle")
              }}
              rows={1}
              placeholder="Describe a disruption, e.g. Port congestion at Shanghai Hub affecting Chip Family C shipments..."
              className="mt-1 h-14 w-full resize-none rounded-md border border-border bg-card px-4 py-[15px] text-sm font-semibold leading-6 text-foreground shadow-sm outline-none placeholder:text-muted-foreground transition focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </label>
          <label className="relative block">
            <span className="text-xs font-semibold text-muted-foreground">Time Horizon</span>
            <button
              type="button"
              aria-label={`Time Horizon: ${horizon}`}
              onClick={() => {
                setHorizonOpen((open) => !open)
              }}
              className="mt-1 flex h-14 w-full items-center justify-between rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/40"
            >
              {horizon}
              <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", horizonOpen && "rotate-180")} />
            </button>
            {horizonOpen && (
              <div className="absolute z-40 mt-2 w-full overflow-hidden rounded-md border border-border bg-card shadow-lg">
                {horizons.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setHorizon(item)
                      setHorizonOpen(false)
                    }}
                    className={cn("block w-full px-4 py-2 text-left text-sm font-semibold hover:bg-secondary", item === horizon && "bg-accent text-primary")}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </label>
          <button
            type="button"
            onClick={runSimulation}
            className="mt-[21px] inline-flex h-14 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 lg:mt-[21px]"
          >
            <RefreshCw className={cn("size-4", simulationState === "running" && "animate-spin")} />
            <span>{simulationState === "running" ? "Generating..." : simulationState === "complete" ? "Updated" : "Generate"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-[0.8fr_1.45fr] min-[1800px]:grid-cols-[0.72fr_1.3fr_1.05fr]">
        <Card>
          <SectionTitle icon={Sparkles} title="Selected Disruption" danger />
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">AI-generated from scenario</p>
            <p className="mt-1.5 text-sm font-semibold leading-5 text-foreground">{breakdown.scenario}</p>
          </div>
          <dl className="grid grid-cols-[104px_1fr] gap-x-3 gap-y-2.5 px-4 py-3 text-sm">
            {[
              ["Type", breakdown.type],
              ["Supplier / Node", breakdown.supplier],
              ["Location", breakdown.location],
              ["Start Date", incident.startDate],
              ["Est. Duration", breakdown.duration],
            ].map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="font-semibold text-muted-foreground">{key}</dt>
                <dd className="font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <SectionTitle icon={AlertTriangle} title="Estimated Impact (Without Action)" danger />
          <div className="grid grid-cols-2 divide-border px-3 py-4 sm:grid-cols-5 sm:divide-x">
            {generatedImpactMetrics.map((metric) => {
              const Icon = metric.icon
              return (
                <div key={metric.label} className="flex min-h-[120px] flex-col items-center justify-center px-2 py-1 text-center">
                  <Icon className="size-5 text-muted-foreground" />
                  <p className="mt-2 min-h-7 text-xs font-bold leading-snug text-muted-foreground">{metric.label}</p>
                  <p className={cn("mt-1.5 whitespace-nowrap text-lg font-bold tabular-nums text-foreground min-[1800px]:text-xl", metric.danger && "text-danger")}>{metric.value}</p>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="xl:col-span-2 min-[1800px]:col-span-1">
          <SectionTitle icon={Trophy} title="Quick Recommendation" />
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[0.75fr_1fr]">
            <div>
              <p className="text-xs font-bold text-muted-foreground">Selected Option</p>
              <p className="mt-2 text-lg font-bold text-foreground">{selectedOption.id} - {selectedOption.desc}</p>
              <p className="mt-4 text-xs font-bold text-muted-foreground">Adaptive CHAIN Score</p>
              <p className="mt-2 text-4xl font-bold text-primary">{weightedScore} <span className="text-2xl text-primary">/ 100</span></p>
            </div>
            <div className="border-l border-border pl-5">
              <p className="text-xs font-bold text-muted-foreground">Reason</p>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-foreground">{selectedOption.reason}</p>
              <p className="mt-4 rounded-md border border-primary/20 bg-accent p-3 text-xs font-bold text-primary">
                Click any option below or adjust weights to re-score the recommendation.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(380px,0.55fr)]">
        <Card>
          <SectionTitle title="Recovery Options Ranked by Adaptive CHAIN Score" />
          <div className="overflow-x-auto p-3">
            <table className="w-full min-w-[820px] text-left text-xs">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-3 py-2 font-bold">Rank</th>
                  <th className="px-3 py-2 font-bold">Recovery Option</th>
                  <th className="px-3 py-2 font-bold">Option Type</th>
                  <th className="px-3 py-2 font-bold">Adaptive CHAIN Score</th>
                  <th className="px-3 py-2 font-bold">Cost Impact</th>
                  <th className="px-3 py-2 font-bold">Lead Time Impact</th>
                  <th className="px-3 py-2 font-bold">At Risk Value</th>
                </tr>
              </thead>
              <tbody>
                {recoveryOptions.map((option) => {
                  const tone = toneClasses[option.tone]
                  const rowScore = Math.round(option.dims.reduce((sum, score, index) => sum + score * weights[index], 0) / 100)
                  const isSelected = option.id === selectedId
                  return (
                    <tr
                      key={option.rank}
                      onClick={() => chooseOption(option.id)}
                      className={cn("cursor-pointer border-b border-border last:border-b-0 hover:bg-secondary/60", isSelected && "rounded-md outline outline-2 outline-primary/35")}
                    >
                      <td className="px-3 py-2.5">
                        <span className={cn("inline-flex size-8 items-center justify-center rounded-md border text-sm font-bold", tone.border, tone.text, tone.bg)}>{option.rank}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className={cn("font-bold", tone.text)}>{option.id}</p>
                        <p className="mt-1 font-medium text-foreground">{option.desc}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={cn("rounded-md px-2 py-1 font-bold", tone.bg, tone.text)}>{option.type}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-3">
                          <span className="min-w-14 text-sm font-bold text-foreground">{rowScore} / 100</span>
                          <span className="h-2 w-28 overflow-hidden rounded-full bg-secondary">
                            <span className={cn("block h-full rounded-full", tone.bar)} style={{ width: `${rowScore}%` }} />
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-foreground">{option.cost}<p className="text-[10px] text-muted-foreground">{option.costValue}</p></td>
                      <td className={cn("px-3 py-2.5 font-bold", option.lead.includes("1") ? "text-primary" : option.lead.includes("14") || option.lead.includes("7") || option.lead.includes("6") ? "text-warning-foreground" : "text-foreground")}>{option.lead}</td>
                      <td className="px-3 py-2.5 font-bold text-foreground">{option.risk}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border p-4">
            <button
              type="button"
              onClick={() => setCustomBuilderOpen((open) => !open)}
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
            >
              <Plus className="size-4" />
              {customOption ? "Edit Custom Option" : "Add Custom Option"}
            </button>
            {customBuilderOpen && (
              <div className="mt-4 grid gap-3 rounded-md border border-border bg-muted/20 p-4 md:grid-cols-3">
                {[
                  ["balanced", "Balanced hybrid", "Mix rerouting, inventory buffer, and qualified logistics."],
                  ["fast", "Fastest SLA recovery", "Use premium freight for top customer commitments."],
                  ["low-cost", "Lowest cost recovery", "Protect margin with inventory swaps and resequencing."],
                ].map(([mode, title, desc]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => createCustomOption(mode as "balanced" | "fast" | "low-cost")}
                    className="rounded-md border border-border bg-card p-3 text-left transition hover:border-primary hover:bg-accent"
                  >
                    <p className="text-sm font-bold text-foreground">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{desc}</p>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-4 rounded-md border border-primary/20 bg-accent p-4">
              <p className="text-sm font-bold text-primary">{selectedOption.id}: {selectedOption.desc}</p>
              <p className="mt-1 text-xs leading-5 text-foreground">{selectedOption.reason}</p>
              <div className="mt-3 grid gap-2 text-xs font-semibold text-muted-foreground sm:grid-cols-3">
                <span>Score: <strong className="text-foreground">{weightedScore}/100</strong></span>
                <span>Cost: <strong className="text-foreground">{selectedOption.cost}</strong></span>
                <span>Lead time: <strong className="text-foreground">{selectedOption.lead}</strong></span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Decision Controls" />
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={normalizeWeights}
                className="rounded-md border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary"
              >
                Reset Equal Weights
              </button>
              <button
                type="button"
                onClick={() => {
                  setWeights([10, 15, 35, 25, 15])
                }}
                className="rounded-md border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary"
              >
                Speed First
              </button>
              <button
                type="button"
                onClick={() => {
                  setWeights([35, 15, 15, 20, 15])
                }}
                className="rounded-md border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary"
              >
                Cost Control
              </button>
            </div>
            {dimensions.map((dimension, index) => (
              <div key={dimension.key} className="grid grid-cols-[minmax(0,1fr)_96px_78px] items-center gap-3 text-sm">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <span className={cn("inline-flex size-6 items-center justify-center rounded-md text-xs font-bold", dimension.color)}>{dimension.key}</span>
                  {dimension.label}
                </span>
                <span className="h-1.5 rounded-full bg-secondary">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${weights[index] * 2.5}%` }} />
                </span>
                <span className="flex overflow-hidden rounded-md border border-border">
                  <button type="button" onClick={() => adjustWeight(index, -5)} className="size-7 font-bold hover:bg-secondary">-</button>
                  <span className="flex w-8 items-center justify-center text-xs font-bold">{weights[index]}</span>
                  <button type="button" onClick={() => adjustWeight(index, 5)} className="size-7 font-bold hover:bg-secondary">+</button>
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-4 text-sm font-bold">
              <span>Total</span>
              <span className={cn(totalWeight === 100 ? "text-foreground" : "text-warning-foreground")}>{totalWeight}%</span>
            </div>
            <div className="rounded-md border border-border bg-muted/20 p-3">
              <p className="text-xs font-bold text-muted-foreground">Selected option dimensions</p>
              <div className="mt-3 grid gap-2">
                {dimensions.map((dimension, index) => (
                  <div key={dimension.key} className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-3 text-xs">
                    <span className="font-semibold text-foreground">{dimension.label}</span>
                    <span className="text-right font-bold text-primary">{selectedOption.dims[index]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 min-[1500px]:grid-cols-[1fr_0.8fr]">
        <Card>
          <SectionTitle title="Trade-off View (Cost vs Lead Time vs Risk)" />
          <div className="p-4">
            <TradeoffChart selectedId={selectedId} onSelect={chooseOption} />
          </div>
        </Card>

        <Card>
          <SectionTitle title="Recommendation Rationale" />
          <div className="space-y-3 p-4">
            {recommendationsByOption[selectedOption.id].map((item) => (
              <p key={item} className="flex gap-3 text-xs font-semibold leading-5 text-foreground">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                {item}
              </p>
            ))}
            <div className="rounded-md border border-primary/25 bg-accent p-4 text-center text-sm font-bold text-primary">
              {selectedOption.id} currently scores {weightedScore}/100 under your active weights.
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-2 text-xs text-muted-foreground">
        <p>All scores are calculated based on real-time data and predictive analytics. Final decision is subject to business review and approval.</p>
        <p className="flex items-center gap-2">Last updated: 06 Jun 2026 10:30 AM <SlidersHorizontal className="size-4" /></p>
      </div>
    </div>
  )
}
