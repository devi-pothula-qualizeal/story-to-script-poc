import type { InvestReview, RefinedUserStory, Scenario } from '@/types/pipeline';

function formatScenario(scenario: Scenario, index: number): string {
  return [
    `Scenario ${index + 1}: ${scenario.title}`,
    `  Given ${scenario.given}`,
    `  When ${scenario.when}`,
    `  Then ${scenario.then}`,
  ].join('\n');
}

function formatInvestReview(review: InvestReview): string {
  return [
    `Independent: ${review.independent}`,
    `Negotiable: ${review.negotiable}`,
    `Valuable: ${review.valuable}`,
    `Estimable: ${review.estimable}`,
    `Small: ${review.small}`,
    `Testable: ${review.testable}`,
  ].join('\n');
}

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
      '',
    );
  }

  if (story.invest_review) {
    sections.push('INVEST Review:', formatInvestReview(story.invest_review));
  }

  if (story.assumptions?.length) {
    sections.push('', 'Assumptions:', ...story.assumptions.map((a) => `• ${a}`));
  }

  return sections.join('\n').trim();
}

export function formatClarificationQuestions(questions?: string[] | null): string {
  return questions?.map((q, i) => `${i + 1}. ${q}`).join('\n\n') ?? '';
}