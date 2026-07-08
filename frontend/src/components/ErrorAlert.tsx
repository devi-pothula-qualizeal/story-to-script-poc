interface ErrorAlertProps {
  title: string;
  message: string;
  onDismiss?: () => void;
}

export function ErrorAlert({ title, message, onDismiss }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-4 text-sm text-red-100"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-red-50">{title}</p>
          <p className="mt-2 leading-relaxed">{message}</p>
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-red-100 underline-offset-2 hover:underline"
          >
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}
