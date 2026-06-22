"use client";

// Lightweight SVG circular progress ring — no chart library needed.
// Colours itself by the eligibility threshold.

interface AttendanceRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  threshold?: number;
  label?: string;
}

export function AttendanceRing({
  percentage,
  size = 140,
  strokeWidth = 12,
  threshold = 75,
  label = "Overall",
}: AttendanceRingProps) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const colorVar = clamped >= threshold ? "var(--color-success, oklch(0.6 0.15 150))" : "var(--destructive)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorVar}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground">{clamped}%</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
