import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface StoryIntakeFormProps {
  userStory: string;
  isLoading: boolean;
  disabled?: boolean;
  onUserStoryChange: (value: string) => void;
  onSubmit: () => void;
}

export function StoryIntakeForm({
  userStory,
  isLoading,
  disabled = false,
  onUserStoryChange,
  onSubmit,
}: StoryIntakeFormProps) {
  const isDisabled = disabled || isLoading;
  const canSubmit = userStory.trim().length > 0 && !isDisabled;

  return (
    <section className="rounded-xl border border-surface-border bg-surface-card p-6">
      <div className="space-y-5">
        <div>
          <label htmlFor="user-story" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">
            User Story
          </label>
          <Textarea
            id="user-story"
            value={userStory}
            onChange={(event) => onUserStoryChange(event.target.value)}
            placeholder="As a [user], I want [goal], so that [benefit]..."
            disabled={isDisabled}
            className="min-h-32"
          />
        </div>

        <p className="text-sm text-muted">
          Agent 1 will refine this against INVEST (Independent, Negotiable, Valuable, Estimable, Small,
          Testable) before it moves down the pipeline.
        </p>

        <Button type="button" onClick={onSubmit} disabled={!canSubmit} variant="primary">
          {isLoading ? 'Refining User Story...' : 'Submit'}
        </Button>
      </div>
    </section>
  );
}
