#!/usr/bin/env node

import fs from 'node:fs/promises';
import process from 'node:process';
import { choice, noul, score, TypeSafeClient } from '@typesafe-ai/sdk';
import {
  buildQuestions,
  buildState,
  deriveDecision,
  indexExistingData,
  inspectDeterministicSignals,
  rankExistingCandidates,
  validateIncoming,
} from './jev-candidate-filter-lib.mjs';

const FIXTURE_PATH = new URL('../fixtures/jev-candidate-filter/historical-decisions.json', import.meta.url);
const DATA_PATH = new URL('../src/data.json', import.meta.url);

function parseArgs(argv) {
  const args = { fixture: false, dryRun: false, input: '', model: 'jev-latest' };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--fixture') args.fixture = true;
    else if (value === '--dry-run') args.dryRun = true;
    else if (value === '--input') args.input = argv[++index] ?? '';
    else if (value === '--model') args.model = argv[++index] ?? 'jev-latest';
    else if (value === '--help' || value === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  return args;
}

function printHelp() {
  console.log(`AI Game Tracker Jev candidate filter POC

Usage:
  npm run jev:fixture
  node scripts/jev-candidate-filter.mjs --input path/to/candidate.json --dry-run
  TYPESAFE_API_KEY=... node scripts/jev-candidate-filter.mjs --input path/to/candidate.json

The command prints JSON to stdout. It never writes src/data.json or src/changelog.json.`);
}

async function readJson(pathOrUrl) {
  return JSON.parse(await fs.readFile(pathOrUrl, 'utf8'));
}

function prepare(incoming, data) {
  const validationErrors = validateIncoming(incoming);
  if (validationErrors.length) {
    throw new Error(`Invalid candidate:\n- ${validationErrors.join('\n- ')}`);
  }
  const ranked = rankExistingCandidates(incoming, indexExistingData(data));
  const deterministic = inspectDeterministicSignals(incoming, ranked);
  const state = buildState(incoming, ranked);
  const questions = buildQuestions({ choice, noul, score });
  return { ranked, deterministic, state, questions };
}

async function runFixture({ dryRun }) {
  const fixture = await readJson(FIXTURE_PATH);
  const rows = fixture.cases.map((testCase) => {
    const decision = dryRun
      ? null
      : deriveDecision({
          incoming: testCase.incoming,
          deterministic: testCase.deterministic,
          answers: testCase.mock_answers,
        });
    return {
      id: testCase.id,
      note: testCase.note,
      expected: testCase.expected,
      actual: decision
        ? {
            route: decision.route,
            monthly_importance: decision.monthly_importance.level,
            is_duplicate: decision.is_duplicate.value,
          }
        : null,
      passed:
        dryRun ||
        (decision.route === testCase.expected.route &&
          decision.monthly_importance.level === testCase.expected.monthly_importance &&
          decision.is_duplicate.value === testCase.expected.is_duplicate),
    };
  });
  const failures = rows.filter((row) => !row.passed);
  console.log(
    JSON.stringify(
      {
        mode: dryRun ? 'fixture-dry-run' : 'fixture-composer-test',
        warning: 'Mock judgments validate policy composition only; they do not measure Jev model accuracy.',
        total: rows.length,
        passed: rows.length - failures.length,
        failed: failures.length,
        cases: rows,
      },
      null,
      2,
    ),
  );
  if (failures.length) process.exitCode = 1;
}

async function runLive({ input, dryRun, model }) {
  if (!input) throw new Error('--input is required unless --fixture is used');
  const [incoming, data] = await Promise.all([readJson(input), readJson(DATA_PATH)]);
  const prepared = prepare(incoming, data);

  if (dryRun) {
    console.log(
      JSON.stringify(
        {
          mode: 'dry-run',
          deterministic: prepared.deterministic,
          shortlist: prepared.ranked.map(({ record, score: matchScore }) => ({
            id: record.id,
            product_name: record.product_name,
            company_name: record.company_name,
            match_score: Number(matchScore.toFixed(4)),
          })),
          state: prepared.state,
          questions: prepared.questions,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (!process.env.TYPESAFE_API_KEY) {
    throw new Error('TYPESAFE_API_KEY is not present. Use --dry-run until credential setup is explicitly approved.');
  }

  const client = new TypeSafeClient({ defaultModel: model, logLevel: 'warn' });
  const response = await client.systemOne({
    state: prepared.state,
    questions: prepared.questions,
    model,
  });
  const decision = deriveDecision({
    incoming,
    deterministic: prepared.deterministic,
    answers: response.answers,
  });

  console.log(
    JSON.stringify(
      {
        mode: 'live',
        model: response.model,
        usage: response.usage,
        deterministic: prepared.deterministic,
        raw_judgments: response.answers,
        decision,
      },
      null,
      2,
    ),
  );
}

const args = parseArgs(process.argv.slice(2));
if (args.help) printHelp();
else if (args.fixture) await runFixture(args);
else await runLive(args);
