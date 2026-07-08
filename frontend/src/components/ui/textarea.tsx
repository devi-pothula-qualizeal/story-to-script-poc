import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={[
        'w-full resize-y rounded-md border border-surface-border bg-surface-input px-3 py-2.5',
        'text-sm text-foreground placeholder:text-muted/70',
        'focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      ].join(' ')}
      {...props}
    />
  );
}
