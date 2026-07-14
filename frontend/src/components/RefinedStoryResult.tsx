import { AgentOutputPanel } from '@/components/AgentOutputPanel';
import { AssumptionsCard } from '@/components/AssumptionsCard';
import { InvestScorecard } from '@/components/InvestScorecard';
import type { InvestReview } from '@/types/pipeline';

interface RefinedStoryResultProps {
  content: string;
  timeLeft: number;
  investReview?: InvestReview | null;
  assumptions?: string[] | null;
}

export function RefinedStoryResult({
  content,
  timeLeft,
  investReview,
  assumptions,
}: RefinedStoryResultProps) {
  const listedAssumptions = assumptions?.filter((item) => item.trim()) ?? [];

  return (
    <div className="space-y-4">
      <AgentOutputPanel
        title="Refined user story"
        subtitle={`Agent 1 output · INVEST-aligned · displaying for ${timeLeft} seconds`}
        content={content}
        timeLeft={timeLeft}
      />
      {listedAssumptions.length > 0 ? (
        <AssumptionsCard assumptions={listedAssumptions} />
      ) : null}
      {investReview ? <InvestScorecard review={investReview} /> : null}
    </div>
  );
}
