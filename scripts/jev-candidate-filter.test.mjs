import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {
  deriveDecision,
  normalizeUrl,
  rankExistingCandidates,
  validateIncoming,
} from './jev-candidate-filter-lib.mjs';

const FIXTURE_PATH = new URL('../fixtures/jev-candidate-filter/historical-decisions.json', import.meta.url);

test('URL normalization removes tracking parameters but preserves meaningful query parameters', () => {
  assert.equal(
    normalizeUrl('https://example.com/game/?utm_source=wechat&id=42#top'),
    'example.com/game?id=42',
  );
});

test('candidate ranking favors exact product identity', () => {
  const ranked = rankExistingCandidates(
    { product_name: 'TaleSpark / Project S', company_name: 'TaleSpark' },
    [
      { id: 1, product_name: 'Another Game', company_name: 'Other', aliases: [] },
      { id: 155, product_name: 'TaleSpark / Project S', company_name: 'TaleSpark', aliases: [] },
    ],
  );
  assert.equal(ranked[0].record.id, 155);
  assert.equal(ranked[0].exactName, true);
});

test('input validation requires source content and a primary claim', () => {
  assert.deepEqual(validateIncoming({ title: 'Only a title' }), [
    'content is required',
    'primary_claim is required',
  ]);
});

test('all policy fixtures compose into the expected routing result', async () => {
  const fixture = JSON.parse(await fs.readFile(FIXTURE_PATH, 'utf8'));
  for (const testCase of fixture.cases) {
    const decision = deriveDecision({
      incoming: testCase.incoming,
      deterministic: testCase.deterministic,
      answers: testCase.mock_answers,
    });
    assert.equal(decision.route, testCase.expected.route, `${testCase.id}: route`);
    assert.equal(
      decision.monthly_importance.level,
      testCase.expected.monthly_importance,
      `${testCase.id}: importance`,
    );
    assert.equal(decision.is_duplicate.value, testCase.expected.is_duplicate, `${testCase.id}: duplicate`);
  }
});
