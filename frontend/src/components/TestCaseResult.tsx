import { AgentOutputPanel } from '@/components/AgentOutputPanel';

interface TestCaseResultProps {
  content: string;
  timeLeft: number;
}

export function TestCaseResult({ content, timeLeft }: TestCaseResultProps) {
  return (
    <AgentOutputPanel
      title="Generated test cases"
      subtitle="Agent 2 output · displaying for 1 minute"
      content={content}
      timeLeft={timeLeft}
    />
  );
}
