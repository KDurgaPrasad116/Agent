import React from 'react';

export interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 112,
  strokeWidth = 9,
  showLabel = true,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = '#16A34A'; // Green 75-100
  let labelText = 'Low Risk';
  let labelColor = 'text-emerald-600 dark:text-emerald-400';

  if (clampedScore < 50) {
    strokeColor = '#DC2626'; // Red 0-49
    labelText = 'High Risk';
    labelColor = 'text-red-600 dark:text-red-400';
  } else if (clampedScore < 75) {
    strokeColor = '#D97706'; // Amber 50-74
    labelText = 'Moderate Risk';
    labelColor = 'text-amber-600 dark:text-amber-400';
  }

  return (
    <div className={`relative flex flex-col items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        className="-rotate-90 transform"
        aria-label={`Score: ${clampedScore.toFixed(1)} out of 100`}
      >
        {/* Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-surface-200 dark:text-surface-800"
        />
        {/* Active Animated Metric Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Numerical Readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-heading font-extrabold text-2xl tracking-tight text-surface-900 dark:text-white">
          {clampedScore.toFixed(1)}
        </span>
        <span className="text-[10px] font-mono text-surface-500 uppercase tracking-widest font-semibold -mt-0.5">
          / 100
        </span>
      </div>

      {showLabel && (
        <span className={`text-[11px] font-semibold mt-1.5 ${labelColor}`}>
          {labelText}
        </span>
      )}
    </div>
  );
};
