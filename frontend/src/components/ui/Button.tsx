import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 rounded-lg gap-1.5',
    md: 'text-xs md:text-sm px-4 py-2 rounded-xl gap-2',
    lg: 'text-sm md:text-base px-5 py-2.5 rounded-xl gap-2.5 font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-subtle border border-primary-500',
    secondary:
      'bg-surface-100 hover:bg-surface-200 dark:bg-surface-850 dark:hover:bg-surface-800 text-surface-900 dark:text-surface-100 border border-surface-200 dark:border-surface-700',
    ghost:
      'bg-transparent hover:bg-surface-100 dark:hover:bg-surface-850 text-surface-700 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white',
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-subtle border border-red-500',
    outline:
      'bg-transparent hover:bg-surface-50 dark:hover:bg-surface-900 text-surface-900 dark:text-surface-100 border border-surface-300 dark:border-surface-700',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
