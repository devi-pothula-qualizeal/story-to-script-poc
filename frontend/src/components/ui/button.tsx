import type { ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-foreground hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground',
  secondary:
    'border border-surface-border bg-transparent text-foreground hover:bg-surface-input disabled:text-muted',
};

export function Button({ children, className = '', disabled, variant = 'secondary', ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition-colors',
        'disabled:cursor-not-allowed',
        variantClasses[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}
