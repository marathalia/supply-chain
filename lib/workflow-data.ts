import type { RiskLevel } from "@/lib/data"

export type ScenarioIncident = {
  id: string
  type: string
  scenario: string
  supplier: string
  location: string
  startDate: string
  duration: string
  affectedChipFamily: string
  affectedFamilyId: "A" | "B" | "C" | "D"
  affectedProducts: string[]
  affectedOrders: number
  totalImpactedOrders: number
  impactedCustomers: number
  atRiskValue: string
  revenueAtRisk: string
  delayWithoutAction: string
  delayDays: number
  riskScore: number
  disruptionProb: number
  serviceImpact: string
  productionSlowdown: string
  shortageRisk: RiskLevel
  owner: string
  lastUpdated: string
  signal: string
  recommendedAction: string
}

export type RecoveryPlan = {
  optionId: string
  title: string
  shortTitle: string
  adaptiveScore: number
  status: string
  revisedEta: string
  etaDelta: string
  escalationLevel: string
  nextUpdate: string
  reason: string
}

export type CustomerOrder = {
  id: string
  customer: string
  reason: string
  eta: string
  promisedEta: string
  lateDays: number
  priority: "Critical" | "High" | "Standard"
  action: string
  recommendedAction: string
  communication: "Draft" | "Pending Approval" | "Sent" | "Acknowledged"
}

export type RouteConstraint = {
  optionId: string
  capacity: string
  qualification: "Qualified" | "Conditional" | "Not qualified"
  costToRecover: string
  leadTimeSaved: string
  riskAfterAction: number
  customerPriorityFit: "Strong" | "Moderate" | "Weak"
  constraintNote: string
}

export const scenarioPresets: ScenarioIncident[] = [
  {
    id: "INC-2026-0619-SHANGHAI",
    type: "Port Congestion",
    scenario: "Port congestion at Shanghai Hub delaying Asia-Europe semiconductor shipments",
    supplier: "Shanghai Hub",
    location: "Shanghai, China",
    startDate: "19 Jun 2026",
    duration: "12 Days",
    affectedChipFamily: "Chip Family C",
    affectedFamilyId: "C",
    affectedProducts: ["MCU_C", "SENSOR_K", "MOS_Z"],
    affectedOrders: 612,
    totalImpactedOrders: 1246,
    impactedCustomers: 152,
    atRiskValue: "EUR9.8M",
    revenueAtRisk: "$18.7M",
    delayWithoutAction: "12 Days",
    delayDays: 12,
    riskScore: 78,
    disruptionProb: 41,
    serviceImpact: "Significant",
    productionSlowdown: "12.5%",
    shortageRisk: "High",
    owner: "Logistics Ops",
    lastUpdated: "19 Jun 2026 16:56 SGT",
    signal: "Port dwell time and missed vessel connections are increasing outbound delays for priority APAC lanes.",
    recommendedAction: "Shift urgent orders to Singapore Hub and reserve air capacity for customer-critical shipments.",
  },
  {
    id: "INC-2026-0619-TRADE",
    type: "Export Control / Trade Restriction",
    scenario: "New export-control review slows advanced semiconductor equipment and component movement into China",
    supplier: "APAC compliance corridor",
    location: "China export-control route",
    startDate: "19 Jun 2026",
    duration: "16 Days",
    affectedChipFamily: "Chip Family B",
    affectedFamilyId: "B",
    affectedProducts: ["POWER_IC", "MCU_Y", "IGBT_X"],
    affectedOrders: 748,
    totalImpactedOrders: 1394,
    impactedCustomers: 176,
    atRiskValue: "EUR14.2M",
    revenueAtRisk: "$22.4M",
    delayWithoutAction: "16 Days",
    delayDays: 16,
    riskScore: 82,
    disruptionProb: 46,
    serviceImpact: "Severe",
    productionSlowdown: "15.8%",
    shortageRisk: "High",
    owner: "Trade Compliance",
    lastUpdated: "19 Jun 2026 16:56 SGT",
    signal: "Compliance lead time is rising for controlled components and cross-border documentation checks.",
    recommendedAction: "Prioritise compliant alternate routes, split allocations, and pre-clear customer-critical orders.",
  },
  {
    id: "INC-2026-0619-TAIWAN",
    type: "Geopolitical Route Risk",
    scenario: "Taiwan Strait tension raises risk for OSAT and final-test routes",
    supplier: "OSAT Pro (Taiwan)",
    location: "Taiwan Strait",
    startDate: "19 Jun 2026",
    duration: "14 Days",
    affectedChipFamily: "Chip Family B",
    affectedFamilyId: "B",
    affectedProducts: ["POWER_IC", "MOS_Z", "SENSOR_P"],
    affectedOrders: 418,
    totalImpactedOrders: 1186,
    impactedCustomers: 134,
    atRiskValue: "EUR12.6M",
    revenueAtRisk: "$17.9M",
    delayWithoutAction: "18 Days",
    delayDays: 18,
    riskScore: 76,
    disruptionProb: 37,
    serviceImpact: "Significant",
    productionSlowdown: "11.4%",
    shortageRisk: "High",
    owner: "Regional Ops",
    lastUpdated: "19 Jun 2026 16:56 SGT",
    signal: "APAC route exposure is elevated for OSAT, final test, and customer distribution nodes.",
    recommendedAction: "Activate partial rerouting via Supplier C and Singapore Hub while protecting qualified OSAT capacity.",
  },
  {
    id: "INC-2026-0619-MATERIAL",
    type: "Material Shortage",
    scenario: "Advanced packaging substrate allocation tightens for automotive and industrial customers",
    supplier: "Advanced packaging supplier",
    location: "Japan / Malaysia substrate network",
    startDate: "19 Jun 2026",
    duration: "10 Days",
    affectedChipFamily: "Chip Family D",
    affectedFamilyId: "D",
    affectedProducts: ["PKG_A", "POWER_MOD", "SENSOR_K"],
    affectedOrders: 286,
    totalImpactedOrders: 884,
    impactedCustomers: 91,
    atRiskValue: "EUR6.4M",
    revenueAtRisk: "$9.6M",
    delayWithoutAction: "10 Days",
    delayDays: 10,
    riskScore: 69,
    disruptionProb: 33,
    serviceImpact: "Moderate",
    productionSlowdown: "8.2%",
    shortageRisk: "Medium",
    owner: "Production Planning",
    lastUpdated: "19 Jun 2026 16:56 SGT",
    signal: "Supplier allocation pressure is affecting packaging starts for selected high-reliability products.",
    recommendedAction: "Reschedule lower-priority builds and protect substrate supply for automotive safety stock.",
  },
  {
    id: "INC-2026-0619-ENERGY",
    type: "Energy / Specialty Gas Constraint",
    scenario: "Middle East energy shock increases logistics cost and specialty gas supply uncertainty",
    supplier: "Specialty gas and freight network",
    location: "Middle East shipping corridor",
    startDate: "19 Jun 2026",
    duration: "21 Days",
    affectedChipFamily: "Chip Family A",
    affectedFamilyId: "A",
    affectedProducts: ["FAB_X", "WAFER_A", "MCU_Y"],
    affectedOrders: 356,
    totalImpactedOrders: 972,
    impactedCustomers: 108,
    atRiskValue: "EUR11.1M",
    revenueAtRisk: "$15.3M",
    delayWithoutAction: "15 Days",
    delayDays: 15,
    riskScore: 73,
    disruptionProb: 39,
    serviceImpact: "Significant",
    productionSlowdown: "10.7%",
    shortageRisk: "High",
    owner: "Supply Chain Ops",
    lastUpdated: "19 Jun 2026 16:56 SGT",
    signal: "Fuel cost volatility and specialty gas supply exposure are increasing fab continuity risk.",
    recommendedAction: "Secure buffer gas supply, rebalance inventory from EU hub, and reserve premium freight selectively.",
  },
]

export const activeIncident = scenarioPresets[2]

export function buildIncidentFromPrompt(prompt: string, horizon = "30 Days"): ScenarioIncident {
  const text = prompt.trim()
  const lower = text.toLowerCase()
  const base =
    lower.includes("shanghai") || lower.includes("port") || lower.includes("congestion")
      ? scenarioPresets[0]
      : lower.includes("export") || lower.includes("trade") || lower.includes("control") || lower.includes("china")
        ? scenarioPresets[1]
        : lower.includes("taiwan") || lower.includes("strait") || lower.includes("geopolitical")
          ? scenarioPresets[2]
          : lower.includes("material") || lower.includes("substrate") || lower.includes("shortage") || lower.includes("packaging")
            ? scenarioPresets[3]
            : lower.includes("energy") || lower.includes("gas") || lower.includes("red sea") || lower.includes("middle east") || lower.includes("hormuz")
              ? scenarioPresets[4]
              : scenarioPresets[2]

  return {
    ...base,
    id: `INC-2026-0619-CUSTOM-${base.affectedFamilyId}`,
    scenario: text || base.scenario,
    duration: horizon,
    lastUpdated: "19 Jun 2026 16:56 SGT",
  }
}

export function getRecoveryPlan(incident: ScenarioIncident): RecoveryPlan {
  if (incident.type.includes("Port")) {
    return {
      optionId: "Option 2",
      title: "Partial rerouting via Singapore Hub and priority air lanes",
      shortTitle: "Singapore Hub + priority air lanes",
      adaptiveScore: 84,
      status: "On Track",
      revisedEta: "24 Jun 2026",
      etaDelta: "+5 days",
      escalationLevel: "Regional Logistics",
      nextUpdate: "19 Jun 2026 at 18:00 SGT",
      reason: "Best balance of faster service recovery, limited premium freight cost, and available Singapore capacity.",
    }
  }

  if (incident.type.includes("Export")) {
    return {
      optionId: "Option 2",
      title: "Compliance-cleared rerouting with split allocation",
      shortTitle: "Cleared routes + split allocation",
      adaptiveScore: 80,
      status: "Watching",
      revisedEta: "27 Jun 2026",
      etaDelta: "+8 days",
      escalationLevel: "Trade Compliance",
      nextUpdate: "19 Jun 2026 at 18:00 SGT",
      reason: "Reduces regulatory hold risk while keeping customer-critical orders moving through compliant lanes.",
    }
  }

  if (incident.type.includes("Material")) {
    return {
      optionId: "Option 4",
      title: "Priority allocation and production rescheduling",
      shortTitle: "Priority allocation + reschedule",
      adaptiveScore: 76,
      status: "In Progress",
      revisedEta: "25 Jun 2026",
      etaDelta: "+6 days",
      escalationLevel: "Production Planning",
      nextUpdate: "19 Jun 2026 at 18:00 SGT",
      reason: "Protects high-priority customers while reducing material waste and avoiding unqualified supplier risk.",
    }
  }

  if (incident.type.includes("Energy")) {
    return {
      optionId: "Option 3",
      title: "EU inventory reallocation and selective premium freight",
      shortTitle: "EU inventory + premium freight",
      adaptiveScore: 78,
      status: "Watching",
      revisedEta: "26 Jun 2026",
      etaDelta: "+7 days",
      escalationLevel: "Supply Chain Ops",
      nextUpdate: "19 Jun 2026 at 18:00 SGT",
      reason: "Balances continuity risk, freight cost, and scarce specialty gas exposure.",
    }
  }

  return {
    optionId: "Option 2",
    title: "Partial rerouting via Supplier C and Singapore Hub",
    shortTitle: "Partial rerouting via S2 + S3",
    adaptiveScore: 82,
    status: "On Track",
    revisedEta: "24 Jun 2026",
    etaDelta: "+5 days",
    escalationLevel: "Regional Ops",
    nextUpdate: "19 Jun 2026 at 18:00 SGT",
    reason: "Best balance of speed, cost, risk, and feasibility.",
  }
}

export const selectedRecoveryPlan = getRecoveryPlan(activeIncident)

export function getRecoveryTimeline(plan: RecoveryPlan) {
  return [
    { label: "Disruption detected", status: "done" },
    { label: "Scenario simulated", status: "done" },
    { label: "Route selected", status: "done" },
    { label: "Playbook activated", status: plan.status === "On Track" ? "done" : "active" },
    { label: "Customer notified", status: "active" },
    { label: "Recovery in progress", status: "todo" },
  ] as const
}

export function getRecoveryPlaybook(incident: ScenarioIncident, plan: RecoveryPlan) {
  return [
    {
      team: "Supply Chain",
      code: "SC",
      action: `Validate available supply for ${incident.affectedProducts[0]} and ${incident.affectedProducts[1]}`,
      decision: "Confirm ATP and allocation rules before customer promises change.",
      output: "Capacity confirmation and protected allocation list",
      dependency: "Supplier response",
      time: "17:15",
      status: "In Progress",
      tone: "primary",
    },
    {
      team: "Production",
      code: "PROD",
      action: `Check whether ${incident.affectedChipFamily} builds can be resequenced`,
      decision: "Protect customer-critical orders without breaking qualified process windows.",
      output: "Updated build sequence and constrained SKU list",
      dependency: "Supply allocation",
      time: "17:45",
      status: "Pending Approval",
      tone: "primary",
    },
    {
      team: "Logistics",
      code: "LOG",
      action: plan.title,
      decision: "Reserve only lanes that reduce delay more than they increase risk or cost.",
      output: "Booked recovery route and freight cost estimate",
      dependency: "Route capacity",
      time: "18:00",
      status: "Due Today",
      tone: "warning",
    },
    {
      team: "Sales",
      code: "SALES",
      action: `Prioritise ${incident.impactedCustomers} impacted customers by SLA and revenue exposure`,
      decision: "Separate customers needing proactive calls from standard notification emails.",
      output: "Customer priority list and account-owner assignments",
      dependency: "Revised ETA",
      time: "18:30",
      status: "Pending",
      tone: "muted",
    },
    {
      team: "Customer Team",
      code: "COMM",
      action: "Review generated updates, send approved messages, and collect acknowledgements",
      decision: "No external message should go out before legal/commercial review for high-risk customers.",
      output: "Customer communication status: Draft to Acknowledged",
      dependency: "Sales approval",
      time: "19:00",
      status: "Pending",
      tone: "muted",
    },
  ]
}

export function getCustomerOrders(incident: ScenarioIncident, plan: RecoveryPlan) {
  const baseLateDays = Math.max(1, incident.delayDays - Number.parseInt(plan.etaDelta.replace(/\D/g, ""), 10))
  return [
    {
      id: "PO-55871",
      customer: "Bosch Continental",
      reason: incident.type,
      eta: plan.revisedEta,
      promisedEta: "21 Jun 2026",
      lateDays: baseLateDays + 2,
      priority: "Critical",
      action: plan.title,
      recommendedAction: "Escalate today and confirm protected allocation before customer update.",
      communication: "Draft",
    },
    {
      id: "PO-55902",
      customer: "Dell Technologies",
      reason: incident.scenario,
      eta: plan.revisedEta,
      promisedEta: "22 Jun 2026",
      lateDays: baseLateDays + 1,
      priority: "High",
      action: plan.shortTitle,
      recommendedAction: "Send revised ETA after logistics booking is confirmed.",
      communication: "Pending Approval",
    },
    {
      id: "PO-56021",
      customer: "Samsung SDI",
      reason: incident.type,
      eta: plan.revisedEta,
      promisedEta: "23 Jun 2026",
      lateDays: baseLateDays,
      priority: "High",
      action: plan.title,
      recommendedAction: "Keep on daily watchlist; no leadership escalation unless ETA slips again.",
      communication: "Sent",
    },
    {
      id: "PO-56198",
      customer: "Wistron",
      reason: incident.signal,
      eta: plan.revisedEta,
      promisedEta: "24 Jun 2026",
      lateDays: Math.max(1, baseLateDays - 1),
      priority: "Standard",
      action: plan.shortTitle,
      recommendedAction: "Monitor acknowledgement and update only if recovery lane changes.",
      communication: "Acknowledged",
    },
    {
      id: "PO-56204",
      customer: "NIO Automotive",
      reason: incident.type,
      eta: plan.revisedEta,
      promisedEta: "22 Jun 2026",
      lateDays: baseLateDays + 1,
      priority: "Critical",
      action: plan.shortTitle,
      recommendedAction: "Prioritise account-owner call because automotive SLA exposure is high.",
      communication: "Draft",
    },
  ] satisfies CustomerOrder[]
}

export function getRouteConstraints(incident: ScenarioIncident, plan: RecoveryPlan): RouteConstraint[] {
  const baseRisk = incident.riskScore
  return [
    {
      optionId: "Option 2",
      capacity: "82% available",
      qualification: "Qualified",
      costToRecover: "EUR1.02M",
      leadTimeSaved: `${Math.max(7, incident.delayDays - 5)} days`,
      riskAfterAction: Math.max(28, baseRisk - 32),
      customerPriorityFit: "Strong",
      constraintNote: "Uses existing supplier approvals and Singapore Hub capacity.",
    },
    {
      optionId: "Option 1",
      capacity: "64% available",
      qualification: "Qualified",
      costToRecover: "EUR1.78M",
      leadTimeSaved: `${Math.max(9, incident.delayDays - 3)} days`,
      riskAfterAction: Math.max(34, baseRisk - 24),
      customerPriorityFit: "Moderate",
      constraintNote: "Fastest route, but limited capacity for all affected orders.",
    },
    {
      optionId: "Option 3",
      capacity: "51% available",
      qualification: "Conditional",
      costToRecover: "EUR2.21M",
      leadTimeSaved: `${Math.max(4, incident.delayDays - 8)} days`,
      riskAfterAction: Math.max(42, baseRisk - 16),
      customerPriorityFit: "Moderate",
      constraintNote: "Supplier qualification review required before broad allocation.",
    },
    {
      optionId: "Option 4",
      capacity: "37% available",
      qualification: "Qualified",
      costToRecover: "EUR0.61M",
      leadTimeSaved: `${Math.max(3, incident.delayDays - 9)} days`,
      riskAfterAction: Math.max(48, baseRisk - 10),
      customerPriorityFit: "Weak",
      constraintNote: "Low cost but constrained by available inventory.",
    },
    {
      optionId: "Option 5",
      capacity: "92% feasible",
      qualification: "Qualified",
      costToRecover: "EUR0.23M",
      leadTimeSaved: "0-2 days",
      riskAfterAction: Math.max(55, baseRisk - 4),
      customerPriorityFit: "Weak",
      constraintNote: "Protects margin but leaves customer delay largely unresolved.",
    },
  ].map((constraint) => (constraint.optionId === plan.optionId ? { ...constraint, constraintNote: `${constraint.constraintNote} Recommended plan.` } : constraint))
}

export function getRiskReductionSeries(incident: ScenarioIncident, plan: RecoveryPlan) {
  const after = getRouteConstraints(incident, plan).find((item) => item.optionId === plan.optionId)?.riskAfterAction ?? Math.max(30, incident.riskScore - 28)
  const start = incident.riskScore
  return [start, start - 4, start - 9, start - 15, start - 21, after].map((value) => Math.max(after, Math.round(value)))
}

export function getMonitorLanes(incident: ScenarioIncident, plan: RecoveryPlan) {
  return [
    { name: `${incident.supplier} capacity confirmation`, owner: incident.owner, eta: "19 Jun 2026 17:15", progress: 84, status: "On Track" },
    { name: plan.shortTitle, owner: "Logistics", eta: "19 Jun 2026 18:00", progress: 68, status: "Watching" },
    { name: "Customer ETA notifications", owner: "Customer Team", eta: "19 Jun 2026 18:30", progress: 52, status: "At Risk" },
    { name: `${incident.affectedChipFamily} production resequencing`, owner: "Production", eta: "19 Jun 2026 17:45", progress: 76, status: "On Track" },
  ]
}

export function getMonitorEvents(incident: ScenarioIncident, plan: RecoveryPlan) {
  return [
    { time: "16:56", title: "Scenario promoted to active incident", body: `${incident.scenario} is now driving See, Decide, Act, Monitor, and AI context.` },
    { time: "16:52", title: `${plan.optionId} approved for execution`, body: `${plan.title} moved into the Act module.` },
    { time: "16:41", title: "External risk signal updated", body: incident.signal },
    { time: "16:30", title: "SLA watchlist recalculated", body: `${Math.ceil(incident.totalImpactedOrders * 0.027)} orders require daily monitoring until recovery closes.` },
  ]
}

export const recoveryTimeline = getRecoveryTimeline(selectedRecoveryPlan)
export const recoveryPlaybook = getRecoveryPlaybook(activeIncident, selectedRecoveryPlan)
export const customerOrders = getCustomerOrders(activeIncident, selectedRecoveryPlan)
export const monitorLanes = getMonitorLanes(activeIncident, selectedRecoveryPlan)
export const monitorEvents = getMonitorEvents(activeIncident, selectedRecoveryPlan)

export const responseWorkflow = {
  see: "Detect risk signals and map exposed routes.",
  decide: "Simulate the active scenario and rank recovery options.",
  act: "Execute the selected recovery playbook and draft customer updates.",
  monitor: "Track recovery progress, SLA exposure, and remaining escalations.",
} as const

export function calculateRouteScore({
  cost,
  leadTime,
  supplierCapability,
  riskReduction,
  feasibility,
}: {
  cost: number
  leadTime: number
  supplierCapability: number
  riskReduction: number
  feasibility: number
}) {
  return Math.round(cost * 0.2 + leadTime * 0.2 + supplierCapability * 0.2 + riskReduction * 0.2 + feasibility * 0.2)
}
