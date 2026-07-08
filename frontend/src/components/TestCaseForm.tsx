import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TestCaseFormProps {
  refinedStory: string;
  isLoading: boolean;
  disabled?: boolean;
  onSubmit: () => void;
}

export function TestCaseForm({ refinedStory, isLoading, disabled = false, onSubmit }: TestCaseFormProps) {
  const isDisabled = disabled || isLoading;
  return (
    <section className="rounded-xl border border-surface-border bg-surface-card p-6">
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Generate test cases</h2>
          <p className="mt-1 text-sm text-muted">
            Agent 2 will derive structured test cases from the refined user story below.
          </p>
        </div>

        <div>
          <label htmlFor="refined-story" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
            Refined User Story
          </label>
          <Textarea
            id="refined-story"
            value={refinedStory}
            readOnly
            className="min-h-48 cursor-default opacity-90"
          />
        </div>

        <Button type="button" onClick={onSubmit} disabled={isDisabled} variant="primary">
          {isLoading ? 'Generating Test Cases...' : 'Generate Test Cases'}
        </Button>
      </div>
    </section>
  );
}
