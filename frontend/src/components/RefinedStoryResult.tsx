import { AgentOutputPanel } from '@/components/AgentOutputPanel';

interface RefinedStoryResultProps {
  content: string;
  timeLeft: number;
}

export function RefinedStoryResult({ content, timeLeft }: RefinedStoryResultProps) {
  return (
    <AgentOutputPanel
      title="Refined user story"
      subtitle={`Agent 1 output · INVEST-aligned · displaying for ${timeLeft} seconds`}
      content={content}
      timeLeft={timeLeft}
    />
  );
}
