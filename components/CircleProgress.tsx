'use client'

interface CircleProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color: string
}

const colorMap: Record<string, { stroke: string; text: string; bg: string }> = {
  violet:  { stroke: '#ec4899', text: 'text-pink-500',    bg: 'bg-pink-100' },
  sky:     { stroke: '#f43f5e', text: 'text-rose-500',    bg: 'bg-rose-100' },
  teal:    { stroke: '#d946ef', text: 'text-fuchsia-500', bg: 'bg-fuchsia-100' },
  rose:    { stroke: '#f43f5e', text: 'text-rose-500',    bg: 'bg-rose-100' },
  amber:   { stroke: '#f59e0b', text: 'text-amber-500',   bg: 'bg-amber-100' },
  emerald: { stroke: '#ec4899', text: 'text-pink-500',    bg: 'bg-pink-100' },
  indigo:  { stroke: '#d946ef', text: 'text-fuchsia-500', bg: 'bg-fuchsia-100' },
  pink:    { stroke: '#ec4899', text: 'text-pink-500',    bg: 'bg-pink-100' },
}

export default function CircleProgress({
  percentage,
  size = 48,
  strokeWidth = 4,
  color,
}: CircleProgressProps) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  const c = colorMap[color] ?? colorMap.violet

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={c.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring__circle"
        />
      </svg>
      <span className={`text-xs font-semibold ${c.text} z-10`}>
        {Math.round(percentage)}%
      </span>
    </div>
  )
}
