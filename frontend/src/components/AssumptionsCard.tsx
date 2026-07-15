interface AssumptionsCardProps {
    assumptions: string[];
  }
  
  export function AssumptionsCard({ assumptions }: AssumptionsCardProps) {
    if (!assumptions.length) {
      return null;
    }
  
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/50">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Assumptions</h3>
          <span className="text-sm text-red-600 dark:text-red-400">
            {assumptions.length} listed
          </span>
        </div>
  
        <ul className="space-y-2">
          {assumptions.map((assumption, index) => (
            <li
              key={`${index}-${assumption.slice(0, 24)}`}
              className="flex gap-3 text-sm leading-relaxed text-red-800 dark:text-red-200"
            >
              <span className="mt-0.5 shrink-0 font-semibold tabular-nums text-red-500 dark:text-red-400">
                {index + 1}.
              </span>
              <span>{assumption}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }