import { type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: ReactNode;
}

export function Input({ label, error, hint, prefix, className = '', id, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-pp-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-pp-text-muted font-medium pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full px-3.5 py-2.5 text-sm border rounded-lg transition-colors bg-white
            ${prefix ? 'pl-8' : ''}
            ${error ? 'border-pp-error focus:border-pp-error focus:ring-1 focus:ring-pp-error' : 'border-pp-border focus:border-pp-accent focus:ring-1 focus:ring-pp-accent'}
            placeholder:text-pp-text-muted outline-none ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-pp-error">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-pp-text-muted">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const textareaId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-medium text-pp-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-3.5 py-2.5 text-sm border rounded-lg transition-colors bg-white
          ${error ? 'border-pp-error' : 'border-pp-border focus:border-pp-accent focus:ring-1 focus:ring-pp-accent'}
          placeholder:text-pp-text-muted outline-none resize-none ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-pp-error">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className = '', id, children, ...props }: SelectProps) {
  const selectId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-medium text-pp-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3.5 py-2.5 text-sm border rounded-lg transition-colors bg-white
          ${error ? 'border-pp-error' : 'border-pp-border focus:border-pp-accent focus:ring-1 focus:ring-pp-accent'}
          outline-none cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-pp-error">{error}</p>}
    </div>
  );
}
