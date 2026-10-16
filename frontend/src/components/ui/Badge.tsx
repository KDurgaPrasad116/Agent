import React from 'react';

export interface BadgeProps {
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  dot = false,
  className = '',
}) => {
  const variantStyles = {
    neutral:
      'bg-surface-100 dark:bg-surface-850 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-700',
    primary:
      'bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800',
    success:
      'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/80',
    warning:
      'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/80',
    danger:
      'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/80',
    info:
      'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/80',
  };

  const dotColors = {
    neutral: 'bg-surface-400',
    primary: 'bg-primary-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-sky-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      <span>{children}</span>
    </span>
  );
};

export interface RiskBadgeProps {
  scoreOrBand: number | 'CRITICAL_RISK' | 'HIGH_RISK' | 'MEDIUM_RISK' | 'MODERATE_RISK' | 'LOW_RISK' | 'SAFE' | 'WARNING' | 'DANGER';
  className?: string;
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ scoreOrBand, className = '', showScore = false }) => {
  let variant: 'success' | 'warning' | 'danger' = 'success';
  let label = 'Low Risk';

  if (typeof scoreOrBand === 'number') {
    if (scoreOrBand >= 75) {
      variant = 'success';
      label = showScore ? `${scoreOrBand.toFixed(1)} • Low Risk` : 'Low Risk';
    } else if (scoreOrBand >= 50) {
      variant = 'warning';
      label = showScore ? `${scoreOrBand.toFixed(1)} • Moderate Risk` : 'Moderate Risk';
    } else {
      variant = 'danger';
      label = showScore ? `${scoreOrBand.toFixed(1)} • High Risk` : 'High Risk';
    }
  } else {
    switch (scoreOrBand) {
      case 'SAFE':
      case 'LOW_RISK':
        variant = 'success';
        label = 'Low Risk';
        break;
      case 'WARNING':
      case 'MODERATE_RISK':
      case 'MEDIUM_RISK':
        variant = 'warning';
        label = 'Moderate Risk';
        break;
      case 'DANGER':
      case 'HIGH_RISK':
      case 'CRITICAL_RISK':
      default:
        variant = 'danger';
        label = 'High Risk';
        break;
    }
  }

  return (
    <Badge variant={variant} dot className={className}>
      {label}
    </Badge>
  );
};
