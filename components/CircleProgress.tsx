'use client'

interface CircleProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
}

export default function CircleProgress({
  percentage,
  size = 48,
  strokeWidth = 4,
}: CircleProgressProps) {
  const radius = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(167,139,250,0.2)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={percentage >= 100 ? '#101585' : '#A78BFA'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="progress-ring__circle"
        />
      </svg>
      <span
        className="text-xs font-semibold z-10"
        style={{ color: percentage >= 100 ? '#101585' : '#A78BFA' }}
      >
        {Math.round(percentage)}%
      </span>
    </div>
  )
}
