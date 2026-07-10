import { AgentOutputPanel } from '@/components/AgentOutputPanel';

interface TestCaseResultProps {
  content: string;
  timeLeft: number;
}

export function TestCaseResult({ content, timeLeft }: TestCaseResultProps) {
  return (
    <AgentOutputPanel
      title="Generated test cases"
      subtitle="Agent 2 output · displaying for 5 seconds"
      content={content}
      timeLeft={timeLeft}
    />
  );
}
