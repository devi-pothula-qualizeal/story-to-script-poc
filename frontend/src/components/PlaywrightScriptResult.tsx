import { AgentOutputPanel } from '@/components/AgentOutputPanel';

interface PlaywrightScriptResultProps {
  content: string;
  timeLeft: number;
}

export function PlaywrightScriptResult({
  content,
  timeLeft,
}: PlaywrightScriptResultProps) {
  return (
    <AgentOutputPanel
      title="Playwright test script"
      subtitle="Agent 3 output · Workflow completed"
      content={content}
      timeLeft={timeLeft}
      
    />
  );
}