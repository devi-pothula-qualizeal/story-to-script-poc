interface ConfigurationBannerProps {
  title: string;
  message: string;
  isChecking: boolean;
  onRetry: () => void;
}

export function ConfigurationBanner({ title, message, isChecking, onRetry }: ConfigurationBannerProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-4 text-sm text-amber-100"
    >
      <p className="font-semibold text-amber-50">{title}</p>
      <p className="mt-2 leading-relaxed">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        disabled={isChecking}
        className="mt-3 rounded-md border border-amber-400/50 px-3 py-1.5 text-xs font-semibold text-amber-100 transition-colors hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isChecking ? 'Checking...' : 'Retry'}
      </button>
    </div>
  );
}
