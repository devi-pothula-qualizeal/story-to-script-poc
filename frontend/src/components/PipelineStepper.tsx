import { PIPELINE_STEPS } from '@/constants/pipeline';
import type { PipelineStep } from '@/types/pipeline';

interface PipelineStepperProps {
  currentStep: PipelineStep;
}

function getStepStatus(stepId: PipelineStep, currentStep: PipelineStep) {
  if (stepId < currentStep) return 'complete';
  if (stepId === currentStep) return 'active';
  return 'pending';
}

export function PipelineStepper({ currentStep }: PipelineStepperProps) {
  return (
    <nav aria-label="Pipeline progress" className="rounded-xl border border-surface-border bg-surface-card p-4">
      <ol className="grid grid-cols-4 gap-2">
        {PIPELINE_STEPS.map((step) => {
          const status = getStepStatus(step.id, currentStep);

          return (
            <li key={step.id} className="flex flex-col items-center text-center">
              <div
                className={[
                  'mb-2 flex h-8 w-8 items-center justify-center rounded-md border text-sm font-semibold',
                  status === 'complete' && 'border-success bg-success/10 text-success',
                  status === 'active' && 'border-accent text-accent',
                  status === 'pending' && 'border-surface-border text-muted',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-current={status === 'active' ? 'step' : undefined}
              >
                {status === 'complete' ? '✓' : step.id}
              </div>
              <span
                className={[
                  'text-sm font-medium',
                  status === 'active' ? 'text-accent' : status === 'complete' ? 'text-success' : 'text-muted',
                ].join(' ')}
              >
                {step.label}
              </span>
              {step.sublabel ? (
                <span className="mt-0.5 text-xs text-muted">{step.sublabel}</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
