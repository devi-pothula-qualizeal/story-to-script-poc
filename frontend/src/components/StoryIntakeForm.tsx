import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface StoryIntakeFormProps {
  description: string;
  acceptanceCriteria: string;
  isLoading: boolean;
  disabled?: boolean;
  onDescriptionChange: (value: string) => void;
  onAcceptanceCriteriaChange: (value: string) => void;
  onSubmit: () => void;
}

export function StoryIntakeForm({
  description,
  acceptanceCriteria,
  isLoading,
  disabled = false,
  onDescriptionChange,
  onAcceptanceCriteriaChange,
  onSubmit,
}: StoryIntakeFormProps) {
  const isDisabled = disabled || isLoading;
  const canSubmit = description.trim().length > 0 && acceptanceCriteria.trim().length > 0 && !isDisabled;

  return (
    <section className="rounded-xl border border-surface-border bg-surface-card p-6">
      <div className="space-y-5">
        <div>
          <label htmlFor="description" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Describe the feature or change request..."
            disabled={isDisabled}
            className="min-h-24"
          />
        </div>

        <div>
          <label htmlFor="acceptance-criteria" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
            Acceptance Criteria
          </label>
          <Textarea
            id="acceptance-criteria"
            value={acceptanceCriteria}
            onChange={(event) => onAcceptanceCriteriaChange(event.target.value)}
            placeholder="Capture the key conditions that must be true..."
            disabled={isDisabled}
            className="min-h-24"
          />
        </div>

        <p className="text-sm text-muted">
          Agent 1 will refine this into an INVEST-aligned user story before the workflow pauses for review.
        </p>

        <Button type="button" onClick={onSubmit} disabled={!canSubmit} variant="primary">
          {isLoading ? 'Refining User Story...' : 'Submit'}
        </Button>
      </div>
    </section>
  );
}
