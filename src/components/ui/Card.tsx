import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className = '', noPadding = false }: CardProps) {
  return (
    <div className={`bg-white border border-pp-border rounded-xl ${noPadding ? '' : 'p-5'} ${className}`}>
      {children}
    </div>
  );
}

interface SectionTitleProps {
  children: ReactNode;
  className?: string;
}

export function SectionTitle({ children, className = '' }: SectionTitleProps) {
  return (
    <h3 className={`text-sm font-semibold text-pp-text uppercase tracking-wider ${className}`}>
      {children}
    </h3>
  );
}

interface DetailRowProps {
  label: string;
  children: ReactNode;
  mono?: boolean;
}

export function DetailRow({ label, children, mono = false }: DetailRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-pp-border last:border-0">
      <span className="text-sm text-pp-text-secondary">{label}</span>
      <span className={`text-sm font-medium text-pp-text ${mono ? 'tabular-nums' : ''}`}>{children}</span>
    </div>
  );
}

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  message?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 text-pp-text-muted">{icon}</div>}
      <h3 className="text-base font-semibold text-pp-text mb-1">{title}</h3>
      {message && <p className="text-sm text-pp-text-secondary max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse-soft bg-pp-bg-soft rounded ${className}`} />;
}

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className = '' }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-6 h-6 border-2 border-pp-border border-t-pp-accent rounded-full animate-spin" />
    </div>
  );
}
