import { type ReactNode } from 'react';

type BadgeColor = 'neutral' | 'warning' | 'info' | 'success' | 'error' | 'accent';

interface BadgeProps {
  color?: BadgeColor;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  warning: 'bg-pp-warning-soft text-pp-warning border-pp-warning-border',
  info: 'bg-pp-info-soft text-pp-info border-pp-info-border',
  success: 'bg-pp-success-soft text-pp-success border-pp-success-border',
  error: 'bg-pp-error-soft text-pp-error border-pp-error-border',
  accent: 'bg-pp-accent-soft text-pp-accent border-pp-accent-border',
};

const dotClasses: Record<BadgeColor, string> = {
  neutral: 'bg-neutral-400',
  warning: 'bg-pp-warning',
  info: 'bg-pp-info',
  success: 'bg-pp-success',
  error: 'bg-pp-error',
  accent: 'bg-pp-accent',
};

export function Badge({ color = 'neutral', children, dot = false, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[color]}`} />}
      {children}
    </span>
  );
}
