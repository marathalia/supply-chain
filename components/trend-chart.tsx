"use client"

export function TrendChart({ data, height = 80 }: { data: number[]; height?: number }) {
  const w = 280
  const h = height
  const pad = 6
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const stepX = (w - pad * 2) / (data.length - 1)

  const points = data.map((v, i) => {
    const x = pad + i * stepX
    const y = pad + (1 - (v - min) / range) * (h - pad * 2)
    return [x, y] as const
  })

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")
  const area = `${line} L ${points[points.length - 1][0].toFixed(1)} ${h - pad} L ${points[0][0].toFixed(1)} ${h - pad} Z`
  const last = points[points.length - 1]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Risk score trend over the last 14 days">
      <defs>
        <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-warning)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--color-warning)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#trendFill)" />
      <path d={line} fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="var(--color-warning)" stroke="var(--color-card)" strokeWidth="1.5" />
    </svg>
  )
}
