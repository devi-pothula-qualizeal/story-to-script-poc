import type { RefinedUserStory, Scenario } from '@/types/pipeline';

function formatScenario(scenario: Scenario, index: number): string {
  return [
    `Scenario ${index + 1}: ${scenario.title}`,
    `  Given ${scenario.given}`,
    `  When ${scenario.when}`,
    `  Then ${scenario.then}`,
  ].join('\n');
}

// NOTE: INVEST review and assumptions are rendered as visual cards
// (InvestScorecard / AssumptionsCard), so they are intentionally omitted
// from this plain-text block to avoid duplicating them.
export function formatSuccessStory(story: RefinedUserStory): string {
  const sections: string[] = [];

  if (story.title) {
    sections.push(story.title, '');
  }

  if (story.user_story) {
    sections.push('User Story:', story.user_story, '');
  }

  if (story.acceptance_criteria?.length) {
    sections.push(
      'Acceptance Criteria:',
      ...story.acceptance_criteria.map(formatScenario),
    );
  }

  return sections.join('\n').trim();
}

export function formatClarificationQuestions(questions?: string[] | null): string {
  return questions?.map((q, i) => `${i + 1}. ${q}`).join('\n\n') ?? '';
}