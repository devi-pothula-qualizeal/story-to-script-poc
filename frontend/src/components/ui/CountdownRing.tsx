interface CountdownRingProps {
  timeLeft: number;
  totalSeconds: number;
}

export function CountdownRing({ timeLeft, totalSeconds }: CountdownRingProps) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / totalSeconds;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <svg className="-rotate-90" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-surface-border"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-accent transition-[stroke-dashoffset] duration-1000 ease-linear"
        />
      </svg>
      <span className="absolute text-sm font-semibold text-accent">{timeLeft}</span>
    </div>
  );
}
