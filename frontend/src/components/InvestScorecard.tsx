import type { InvestReview } from '@/types/pipeline';

const PRINCIPLES = [
  ['independent', 'Independent'],
  ['negotiable', 'Negotiable'],
  ['valuable', 'Valuable'],
  ['estimable', 'Estimable'],
  ['small', 'Small'],
  ['testable', 'Testable'],
] as const;

function barColor(score: number): string {
  if (score >= 80) return '#2dd4bf'; // strong
  if (score >= 50) return '#facc15'; // ok
  return '#f87171'; // weak
}

export function InvestScorecard({ review }: { review: InvestReview }) {
  const overall =
    review.overall_score ??
    Math.round(
      PRINCIPLES.reduce((sum, [key]) => sum + (review[key]?.score ?? 0), 0) / PRINCIPLES.length,
    );

  return (
    <section className="rounded-xl border border-surface-border bg-surface-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">INVEST score</h3>
        <span className="text-sm text-muted">
          Overall <span className="font-semibold text-foreground">{overall}%</span>
        </span>
      </div>

      <ul className="space-y-3">
        {PRINCIPLES.map(([key, label]) => {
          const criterion = review[key];
          const score = criterion?.score ?? 0;

          return (
            <li key={key}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-foreground">{label}</span>
                <span className="font-semibold tabular-nums text-foreground">{score}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-input">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{ width: `${score}%`, backgroundColor: barColor(score) }}
                />
              </div>
              {criterion?.assessment ? (
                <p className="mt-1 text-xs text-muted">{criterion.assessment}</p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
