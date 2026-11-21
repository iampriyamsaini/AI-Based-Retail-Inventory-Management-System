import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    primary: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  };

  // Helper matching common business statuses
  let resolvedVariant = variant;
  const lower = String(children || '').toLowerCase();
  if (lower.includes('in stock') || lower.includes('completed') || lower.includes('active') || lower.includes('good') || lower.includes('stock in')) {
    resolvedVariant = 'success';
  } else if (lower.includes('low') || lower.includes('pending') || lower.includes('partially') || lower.includes('near')) {
    resolvedVariant = 'warning';
  } else if (lower.includes('out of stock') || lower.includes('critical') || lower.includes('expired') || lower.includes('rejected') || lower.includes('stock out')) {
    resolvedVariant = 'danger';
  } else if (lower.includes('approved') || lower.includes('draft') || lower.includes('stock adj')) {
    resolvedVariant = 'primary';
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantClasses[resolvedVariant] || variantClasses.default} ${sizeClasses[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-70"></span>
      {children}
    </span>
  );
};
