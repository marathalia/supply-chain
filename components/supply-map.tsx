"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Factory, Minus, PackageCheck, Plus, RotateCcw, Router, Warehouse, X } from "lucide-react"
import { chipFamilies, mapNodes, mapRoutes, type MapNode, type RiskLevel } from "@/lib/data"

// Equirectangular fallback into a 0-100 viewbox space
function project(lon: number, lat: number) {
  return { x: ((lon + 180) / 360) * 100, y: ((90 - lat) / 180) * 100 }
}

const nodeColor: Record<MapNode["type"], string> = {
  supplier: "var(--color-success)",
  manufacturing: "var(--color-primary)",
  logistics: "oklch(0.58 0.14 285)",
  customer: "oklch(0.49 0.12 188)",
}

const nodeLabel: Record<MapNode["type"], string> = {
  supplier: "Supplier Site",
  manufacturing: "Manufacturing Site",
  logistics: "Logistics Hub",
  customer: "Customer / Order Node",
}

const routeStroke: Record<RiskLevel, string> = {
  Low: "var(--color-success)",
  Medium: "var(--color-warning)",
  High: "var(--color-danger)",
}

const nodeIcon: Record<MapNode["type"], typeof Warehouse> = {
  supplier: Warehouse,
  manufacturing: Factory,
  logistics: Router,
  customer: PackageCheck,
}

const dashByMode: Record<string, string> = {
  ocean: "none",
  air: "3 2",
  road: "0.6 1.6",
}

const familyCardTone: Record<string, string> = {
  A: "left-[2.5%] top-[8%] border-success/45 bg-success-muted text-success",
  B: "right-[3%] top-[8%] border-warning/55 bg-warning-muted text-warning-foreground",
  C: "left-[23%] bottom-[9%] border-danger/45 bg-danger-muted text-danger",
  D: "right-[3%] bottom-[9%] border-warning/55 bg-warning-muted text-warning-foreground",
}

const countryByNode: Record<string, string> = {
  silicon: "USA",
  fab: "Germany",
  rotterdam: "Netherlands",
  asahi: "Japan",
  india: "India",
  phoenix: "Mexico",
  shanghai: "China",
  taiwan: "Taiwan",
  penang: "Malaysia",
  singapore: "Singapore",
  australia: "Australia",
}

const labelOffsetByNode: Record<string, CSSProperties> = {
  silicon: { left: "24px", top: "-16px" },
  phoenix: { left: "24px", top: "-4px" },
  fab: { left: "-10px", top: "-44px" },
  rotterdam: { left: "22px", top: "-6px" },
  india: { left: "22px", top: "0" },
  asahi: { right: "20px", top: "-42px" },
  shanghai: { left: "-76px", top: "-34px" },
  taiwan: { left: "24px", top: "0" },
  penang: { left: "24px", top: "-2px" },
  singapore: { left: "24px", top: "-2px" },
  australia: { right: "24px", top: "-44px" },
}

const mapPositionByNode: Record<string, { x: number; y: number }> = {
  silicon: { x: 12, y: 32 },
  phoenix: { x: 25, y: 55 },
  fab: { x: 45, y: 25 },
  rotterdam: { x: 54, y: 30 },
  india: { x: 40, y: 47 },
  asahi: { x: 80, y: 28 },
  shanghai: { x: 75, y: 38 },
  taiwan: { x: 86, y: 40 },
  penang: { x: 78, y: 51 },
  singapore: { x: 74, y: 61 },
  australia: { x: 82, y: 80 },
}

const displayPoint = (node: MapNode) => mapPositionByNode[node.id] ?? project(node.lon, node.lat)

export function SupplyMap({ focusFamily = "All" }: { focusFamily?: string }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null)
  const [activeFamily, setActiveFamily] = useState<string>(focusFamily)
  const [activeRisk, setActiveRisk] = useState<RiskLevel | "All">("All")
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const dragRef = useRef<{ id: number; x: number; y: number; panX: number; panY: number } | null>(null)
  const nodeById = useMemo(() => Object.fromEntries(mapNodes.map((n) => [n.id, n])), [])
  const visibleRoutes = useMemo(
    () =>
      mapRoutes.filter((route) => {
        const familyMatch = activeFamily === "All" || route.family === activeFamily
        const riskMatch = activeRisk === "All" || route.risk === activeRisk
        return familyMatch && riskMatch
      }),
    [activeFamily, activeRisk],
  )
  const visibleNodeIds = useMemo(() => new Set(visibleRoutes.flatMap((route) => [route.from, route.to])), [visibleRoutes])
  const zoomPercent = Math.round(zoom * 100)
  const zoomIn = () => setZoom((current) => Math.min(2.5, Number((current + 0.12).toFixed(2))))
  const zoomOut = () => setZoom((current) => Math.max(0.85, Number((current - 0.12).toFixed(2))))
  const resetMap = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setSelectedNode(null)
  }
  const clearFilters = () => {
    setActiveFamily("All")
    setActiveRisk("All")
  }
  const activeNode = selectedNode ?? (hovered ? nodeById[hovered] : null)

  useEffect(() => {
    setActiveFamily(focusFamily)
  }, [focusFamily])

  const startPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y }
  }

  const movePan = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    if (!drag || drag.id !== event.pointerId) return
    setPan({ x: drag.panX + event.clientX - drag.x, y: drag.panY + event.clientY - drag.y })
  }

  const endPan = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.id === event.pointerId) dragRef.current = null
  }

  const wheelZoom = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    setZoom((current) => {
      const next = current - event.deltaY * 0.0012
      return Math.min(2.5, Math.max(0.85, Number(next.toFixed(2))))
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative h-[min(72vh,760px)] min-h-[560px] w-full touch-none overflow-hidden rounded-md border border-border bg-white"
        onPointerDown={startPan}
        onPointerMove={movePan}
        onPointerUp={endPan}
        onPointerCancel={endPan}
        onWheel={wheelZoom}
        role="application"
        aria-label="Interactive chip family supply map. Drag to pan, use wheel or controls to zoom, and click nodes for details."
      >
        <div
          className="absolute inset-0 cursor-grab transition-transform duration-150 ease-out active:cursor-grabbing"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center center" }}
        >
          <Image
            src="/world-map.png"
            alt="World map of the chip family supply network"
            fill
            className="object-cover opacity-90 brightness-110 contrast-105 saturate-75"
            priority
          />
          <div className="absolute inset-0 bg-white/10" aria-hidden />
          <svg
            viewBox="0 0 100 50"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full"
            aria-hidden
          >
            {mapRoutes.map((route) => {
              const from = nodeById[route.from]
              const to = nodeById[route.to]
              const isVisible = visibleRoutes.some((visible) => visible.id === route.id)
              const a = displayPoint(from)
              const b = displayPoint(to)
              const y1 = a.y / 2
              const y2 = b.y / 2
              const mx = (a.x + b.x) / 2
              const my = Math.min(y1, y2) - Math.max(2.5, Math.abs(a.x - b.x) / 18)
              const d = `M ${a.x} ${y1} Q ${mx} ${my} ${b.x} ${y2}`
              return (
                <g key={route.id}>
                  <path
                    d={d}
                    fill="none"
                    stroke="white"
                    strokeWidth={0.5}
                    strokeLinecap="round"
                    opacity={isVisible ? 0.9 : 0.18}
                  />
                  <path
                    d={d}
                    fill="none"
                    stroke={routeStroke[route.risk]}
                    strokeWidth={isVisible ? 0.34 : 0.16}
                    strokeDasharray={dashByMode[route.mode]}
                    strokeLinecap="round"
                    opacity={isVisible ? (route.risk === "High" ? 1 : 0.92) : 0.14}
                  />
                </g>
              )
            })}
          </svg>

          {mapNodes.map((node) => {
            const p = displayPoint(node)
            const Icon = nodeIcon[node.type]
            const isVisible = visibleNodeIds.has(node.id)
            return (
              <button
                key={node.id}
                type="button"
                className={cn(
                  "group absolute -translate-x-1/2 -translate-y-1/2 text-left transition-opacity",
                  isVisible ? "opacity-100" : "opacity-25",
                )}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => setSelectedNode(node)}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(node.id)}
                onBlur={() => setHovered(null)}
                aria-label={`${node.label} — ${nodeLabel[node.type]}`}
              >
                <span
                  className="relative z-10 flex size-6 items-center justify-center rounded-full border-2 border-white bg-white shadow-md ring-1 transition-transform group-hover:scale-110"
                  style={{ color: nodeColor[node.type], borderColor: nodeColor[node.type] }}
                >
                  <Icon className="size-3" />
                </span>
                <span
                  className={cn(
                    "absolute z-20 whitespace-nowrap rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-bold leading-tight text-foreground shadow-sm",
                    hovered === node.id && "z-30 border-primary text-primary",
                  )}
                  style={labelOffsetByNode[node.id]}
                >
                  {node.label}
                  <span className="block text-[9px] font-normal text-muted-foreground">
                    {countryByNode[node.id]}
                  </span>
                </span>
                {hovered === node.id && (
                  <span className="absolute left-1/2 top-[calc(100%+42px)] z-40 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground shadow-sm">
                    {nodeLabel[node.type]}
                  </span>
                )}
              </button>
            )
          })}

          {chipFamilies.map((family) => (
            <button
              key={family.id}
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => setActiveFamily((current) => (current === family.id ? "All" : family.id))}
              className={cn(
                "absolute z-30 hidden w-40 rounded-md border p-3 text-left text-[12px] shadow-md transition sm:block",
                activeFamily !== "All" && activeFamily !== family.id && "opacity-35",
                activeFamily === family.id && "ring-2 ring-primary/40",
                familyCardTone[family.id],
              )}
            >
              <p className="text-xs font-bold">{family.name}</p>
              <p className="mt-1 text-foreground">
                Delay Risk: <span className="font-semibold">{family.delayDays} days</span>
              </p>
              <p className="text-foreground">
                Risk Score: <span className="font-semibold">{family.riskScore}</span>
              </p>
              <p className="text-foreground">
                Disruption Prob.: <span className="font-semibold">{family.disruptionProb}%</span>
              </p>
            </button>
          ))}
        </div>

        <div className="absolute left-3 top-3 z-30 max-w-[calc(100%-1.5rem)] rounded-md border border-border bg-white/95 p-3 text-xs font-semibold text-muted-foreground shadow-md backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            {(["All", "A", "B", "C", "D"] as const).map((family) => (
              <button
                key={family}
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => setActiveFamily(family)}
                className={cn(
                  "rounded-md border px-2.5 py-1.5 font-bold",
                  activeFamily === family ? "border-primary bg-accent text-primary" : "border-border bg-white text-muted-foreground hover:bg-secondary",
                )}
              >
                {family === "All" ? "All Families" : `Family ${family}`}
              </button>
            ))}
            <span className="mx-1 hidden h-6 w-px bg-border sm:block" />
            {(["All", "Low", "Medium", "High"] as const).map((risk) => (
              <button
                key={risk}
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => setActiveRisk(risk)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 font-bold",
                  activeRisk === risk ? "border-primary bg-accent text-primary" : "border-border bg-white text-muted-foreground hover:bg-secondary",
                )}
              >
                {risk !== "All" && (
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      risk === "Low" && "bg-success",
                      risk === "Medium" && "bg-warning",
                      risk === "High" && "bg-danger",
                    )}
                  />
                )}
                {risk === "All" ? "All Risk" : risk}
              </button>
            ))}
            {(activeFamily !== "All" || activeRisk !== "All") && (
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={clearFilters}
                className="rounded-md px-2.5 py-1.5 font-bold text-primary hover:bg-accent"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="absolute bottom-14 left-3 z-30 hidden w-44 rounded-md border border-border bg-white/95 p-3 text-xs text-muted-foreground shadow-md backdrop-blur xl:block">
          {(Object.keys(nodeLabel) as MapNode["type"][]).map((t) => {
            const Icon = nodeIcon[t]
            return (
              <span key={t} className="mb-2 flex items-center gap-2 last:mb-0">
                <span className="flex size-5 items-center justify-center rounded-full border bg-card" style={{ color: nodeColor[t], borderColor: nodeColor[t] }}>
                  <Icon className="size-3" />
                </span>
                {nodeLabel[t]}
              </span>
            )
          })}
          <div className="mt-2 space-y-1 border-t border-border pt-2">
            <span className="flex items-center gap-2">
              <svg width="28" height="6" aria-hidden><line x1="0" y1="3" x2="28" y2="3" stroke="currentColor" strokeWidth="1.6" /></svg>
              Ocean Freight
            </span>
            <span className="flex items-center gap-2">
              <svg width="28" height="6" aria-hidden><line x1="0" y1="3" x2="28" y2="3" stroke="currentColor" strokeWidth="1.6" strokeDasharray="4 2" /></svg>
              Air Freight
            </span>
            <span className="flex items-center gap-2">
              <svg width="28" height="6" aria-hidden><line x1="0" y1="3" x2="28" y2="3" stroke="currentColor" strokeWidth="1.6" strokeDasharray="1 2" /></svg>
              Road / Rail
            </span>
          </div>
        </div>

        {activeNode && (
          <div className="absolute right-3 top-3 z-40 w-72 rounded-md border border-border bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-foreground">{activeNode.label}</p>
                <p className="text-xs text-muted-foreground">{countryByNode[activeNode.id]} · {nodeLabel[activeNode.type]}</p>
              </div>
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => setSelectedNode(null)}
                className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Close selected node details"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-md bg-secondary p-2">
                <p className="font-semibold text-muted-foreground">Connected routes</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {mapRoutes.filter((route) => route.from === activeNode.id || route.to === activeNode.id).length}
                </p>
              </div>
              <div className="rounded-md bg-secondary p-2">
                <p className="font-semibold text-muted-foreground">Visible now</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {visibleRoutes.filter((route) => route.from === activeNode.id || route.to === activeNode.id).length}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              Click family cards or filter chips to isolate routes. Drag the map to inspect crowded regions; scroll over the map to zoom.
            </p>
          </div>
        )}

        <div className="absolute bottom-3 left-3 z-30 flex overflow-hidden rounded-md border border-border bg-white shadow-md">
          {[
            { icon: Plus, label: "Zoom in", onClick: zoomIn, disabled: zoom >= 2.5 },
            { icon: Minus, label: "Zoom out", onClick: zoomOut, disabled: zoom <= 0.85 },
            { icon: RotateCcw, label: "Reset map", onClick: resetMap, disabled: zoom === 1 && pan.x === 0 && pan.y === 0 && !selectedNode },
          ].map(({ icon: Icon, label, onClick, disabled }) => (
            <button
              key={label}
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={onClick}
              disabled={disabled}
              className="flex size-10 items-center justify-center border-r border-border text-muted-foreground last:border-r-0 hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-muted-foreground"
              aria-label={`${label}. Current zoom ${zoomPercent}%`}
              title={`${label} (${zoomPercent}%)`}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>

        <div className="absolute bottom-3 right-3 z-30 rounded-md border border-border bg-white/95 px-3 py-2 text-xs font-bold text-muted-foreground shadow-md">
          {zoomPercent}% · {visibleRoutes.length} routes visible
        </div>
      </div>
    </div>
  )
}
