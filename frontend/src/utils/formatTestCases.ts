import type { TestCase } from '@/types/pipeline';

function formatOneTestCase(tc: TestCase): string {
  const steps = (tc.steps ?? [])
    .map((step, i) => `  ${i + 1}. ${step}`)
    .join('\n');

  return [
    `${tc.id}: ${tc.scenario}`,
    `Preconditions: ${tc.preconditions}`,
    'Test Steps:',
    steps,
    `Expected Result: ${tc.expected_result}`,
    `Priority: ${tc.priority}`,
    `Test Type: ${tc.test_type}`,
    `Traceability: ${tc.traceability}`,
  ].join('\n');
}

export function formatTestCases(testCases: TestCase[]): string {
  if (!testCases.length) return '';
  return testCases.map(formatOneTestCase).join('\n\n');
}
