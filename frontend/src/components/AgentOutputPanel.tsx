import { DISPLAY_DURATION_SECONDS } from '@/constants/pipeline';
import { CountdownRing } from '@/components/ui/CountdownRing';

interface AgentOutputPanelProps {
  title: string;
  subtitle: string;
  content: string;
  timeLeft: number;
}

export function AgentOutputPanel({ title, subtitle, content, timeLeft }: AgentOutputPanelProps) {
  return (
    <section className="rounded-xl border border-surface-border bg-surface-card p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <CountdownRing timeLeft={timeLeft} totalSeconds={DISPLAY_DURATION_SECONDS} />
      </div>

      <pre className="max-h-96 overflow-auto rounded-lg border border-surface-border bg-surface-input p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
        {content}
      </pre>
    </section>
  );
}
