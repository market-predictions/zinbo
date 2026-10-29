#!/usr/bin/env node
// Small, deliberately limited P0 source-text audit.
// Run after `node scripts/build.mjs`; use --strict as a release gate.
// Only checks exact unwanted strings, never claims grammatical correctness.
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../public/index.html', import.meta.url), 'utf8');
const rules = [
  {
    id: 'P0-08a',
    why: 'Misleading instruction for the pronoun Ik',
    pattern: /Kijk naar Ik\./g,
  },
  {
    id: 'P0-08b',
    why: 'Internal marketing label must not become accessible image text',
    pattern: /Premium illustratie bij /g,
  },
];
let total = 0;
for (const {id, why, pattern} of rules) {
  const matches = [...html.matchAll(pattern)];
  total += matches.length;
  console.log(`${matches.length ? 'FAIL' : 'PASS'} ${id}: ${why}; occurrences=${matches.length}`);
}
console.log(`P0 text audit: ${total} exact-pattern findings; all other P0 items require separate checks.`);
if (process.argv.includes('--strict') && total > 0) process.exitCode = 1;
