export type RiskLevel = "Low" | "Medium" | "High"

export const kpis = [
  { label: "Chip Families Monitored", value: "4", delta: null },
  { label: "Active Routes", value: "28", delta: { dir: "up", text: "12.0% vs yesterday" } },
  { label: "Live Risk Alerts", value: "17", delta: { dir: "up", text: "6 vs yesterday" } },
  { label: "Impacted Orders", value: "1,246", delta: { dir: "up", text: "18.4% vs yesterday" } },
  { label: "Countries Exposed", value: "32", delta: null },
  { label: "Avg. Node Risk Score", value: "56 / 100", delta: { dir: "up", text: "7 vs yesterday" } },
] as const

export type ChipFamily = {
  id: string
  name: string
  route: string
  risk: RiskLevel
  delayDays: number
  riskScore: number
  disruptionProb: number
}

export const chipFamilies: ChipFamily[] = [
  { id: "A", name: "Chip Family A", route: "Rotterdam Hub → Shanghai Hub", risk: "Low", delayDays: 3, riskScore: 32, disruptionProb: 8 },
  { id: "B", name: "Chip Family B", route: "Asahi Materials → OSAT Pro (Taiwan)", risk: "Medium", delayDays: 9, riskScore: 68, disruptionProb: 29 },
  { id: "C", name: "Chip Family C", route: "India Hub → Penang Assembly", risk: "High", delayDays: 14, riskScore: 78, disruptionProb: 41 },
  { id: "D", name: "Chip Family D", route: "Phoenix Electronics → Tech Solutions (AU)", risk: "Medium", delayDays: 6, riskScore: 47, disruptionProb: 17 },
]

// Map nodes positioned via equirectangular projection. lon [-180,180], lat [90,-90]
export type MapNode = {
  id: string
  label: string
  type: "supplier" | "manufacturing" | "logistics" | "customer"
  lon: number
  lat: number
}

export const mapNodes: MapNode[] = [
  { id: "silicon", label: "Silicon Source Inc.", type: "supplier", lon: -122.4, lat: 37.8 },
  { id: "fab", label: "Fab Partner GmbH", type: "manufacturing", lon: 11.6, lat: 48.1 },
  { id: "rotterdam", label: "Rotterdam Hub", type: "logistics", lon: 4.5, lat: 51.9 },
  { id: "asahi", label: "Asahi Materials", type: "supplier", lon: 139.7, lat: 35.7 },
  { id: "india", label: "India Hub", type: "logistics", lon: 77.1, lat: 28.6 },
  { id: "phoenix", label: "Phoenix Electronics", type: "supplier", lon: -112.1, lat: 33.4 },
  { id: "shanghai", label: "Shanghai Hub", type: "logistics", lon: 121.5, lat: 31.2 },
  { id: "taiwan", label: "OSAT Pro (Taiwan)", type: "manufacturing", lon: 120.9, lat: 24.1 },
  { id: "penang", label: "Penang Assembly", type: "manufacturing", lon: 100.3, lat: 5.4 },
  { id: "singapore", label: "Singapore Hub", type: "logistics", lon: 103.8, lat: 1.3 },
  { id: "australia", label: "Tech Solutions (AU)", type: "customer", lon: 151.2, lat: -33.8 },
]

export type MapRoute = {
  id: string
  from: string
  to: string
  mode: "ocean" | "air" | "road"
  family: string
  risk: RiskLevel
}

export const mapRoutes: MapRoute[] = [
  { id: "r1", from: "silicon", to: "fab", mode: "ocean", family: "A", risk: "Low" },
  { id: "r2", from: "fab", to: "rotterdam", mode: "ocean", family: "A", risk: "Low" },
  { id: "r3", from: "rotterdam", to: "shanghai", mode: "air", family: "B", risk: "Medium" },
  { id: "r4", from: "asahi", to: "taiwan", mode: "ocean", family: "B", risk: "Low" },
  { id: "r5", from: "asahi", to: "shanghai", mode: "road", family: "B", risk: "Medium" },
  { id: "r6", from: "shanghai", to: "singapore", mode: "air", family: "C", risk: "High" },
  { id: "r7", from: "india", to: "singapore", mode: "air", family: "C", risk: "High" },
  { id: "r8", from: "india", to: "penang", mode: "road", family: "C", risk: "Medium" },
  { id: "r9", from: "singapore", to: "penang", mode: "ocean", family: "D", risk: "Low" },
  { id: "r10", from: "phoenix", to: "india", mode: "ocean", family: "D", risk: "Medium" },
  { id: "r11", from: "singapore", to: "australia", mode: "air", family: "D", risk: "Medium" },
]

export const downstreamStats = [
  { label: "Affected Orders", value: "1,246", tone: "neutral" as const },
  { label: "Affected Customers", value: "152", tone: "neutral" as const },
  { label: "Revenue at Risk", value: "$18.7M", tone: "danger" as const },
  { label: "Production Slowdown", value: "12.5%", tone: "warning" as const },
  { label: "Shortage Risk", value: "High", tone: "danger" as const },
  { label: "Est. Service Impact", value: "Significant", tone: "warning" as const },
]

export type Alert = {
  id: string
  category: string
  title: string
  severity: "High" | "Medium"
  source: string
  time: string
}

export const alerts: Alert[] = [
  { id: "a1", category: "Trade Restriction", title: "US export restrictions on advanced semiconductor equipment to China", severity: "High", source: "Reuters Trade Desk", time: "10 min ago" },
  { id: "a2", category: "Geopolitical Tension", title: "Escalation in Taiwan Strait", severity: "High", source: "GeoIntel Feed", time: "18 min ago" },
  { id: "a3", category: "Port Congestion", title: "Port congestion at Port of Shanghai", severity: "Medium", source: "MarineTraffic", time: "31 min ago" },
  { id: "a4", category: "Logistics Disruption", title: "Air cargo capacity reduction on Asia–Europe lanes", severity: "Medium", source: "IATA Cargo", time: "40 min ago" },
  { id: "a5", category: "Material Shortage", title: "Advanced packaging substrate allocation tightened for priority customers", severity: "Medium", source: "MaterialWatch", time: "1 hr ago" },
]

export const riskContributors = [
  { factor: "Geopolitical Tensions", impact: "High" as RiskLevel, score: 34 },
  { factor: "Trade Restrictions", impact: "Medium" as RiskLevel, score: 18 },
  { factor: "Port Congestion", impact: "Medium" as RiskLevel, score: 14 },
  { factor: "Logistics Disruption", impact: "Medium" as RiskLevel, score: 14 },
  { factor: "Material Shortage", impact: "Medium" as RiskLevel, score: 12 },
]

// 14-day risk score trend climbing to 68
export const riskTrend = [38, 40, 39, 43, 45, 44, 48, 52, 51, 56, 59, 62, 65, 68]

export const impactedOrders = [
  { id: "C", family: "Chip Family C", orders: 612, pct: 49.1, customers: "Bosch, Continental, ZF Group" },
  { id: "B", family: "Chip Family B", orders: 418, pct: 33.6, customers: "Dell, Lenovo, Flex Ltd." },
  { id: "D", family: "Chip Family D", orders: 148, pct: 11.9, customers: "Whirlpool, Electrolux" },
  { id: "A", family: "Chip Family A", orders: 68, pct: 5.4, customers: "Samsung, HP Inc." },
]

export const transparencyLog = [
  { time: "09:15", text: "External congestion signal received from Port Authority feed" },
  { time: "09:47", text: "AI impact model ran: 3 shipments affected, ETA shift calculated" },
  { time: "10:30", text: "Alert surfaced to customer dashboard" },
]
