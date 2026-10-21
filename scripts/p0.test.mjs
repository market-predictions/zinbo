import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');

test('inline JavaScript remains syntactically valid', () => {
  const scripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attrs]) => !/type=["'](?:application\/json|text\/plain)["']/i.test(attrs));
  assert.ok(scripts.length > 0);
  for (const [, , source] of scripts) new vm.Script(source);
});

test('a sentence capital is positional, not baked into each tile', () => {
  const start = html.indexOf('function caps(s)');
  const end = html.indexOf('function item(){', start);
  assert.ok(start >= 0 && end > start);
  const context = vm.createContext({});
  vm.runInContext(html.slice(start, end) + '\nthis.tileText=sentenceTileText;', context);
  assert.equal(context.tileText({text:'De kinderen'}, 0), 'De kinderen');
  assert.equal(context.tileText({text:'De kinderen'}, 2), 'de kinderen');
  assert.equal(context.tileText({text:'Wij'}, 2), 'wij');
  assert.equal(context.tileText({text:'Oma'}, 1), 'oma');
  assert.equal(context.tileText({text:'Sam'}, 2), 'Sam');
  assert.equal(context.tileText({text:'Sara'}, 2), 'Sara');
});

test('four modal omdat items accept both verb orders', () => {
  const start = html.indexOf('const O3_PILOT = [');
  const end = html.indexOf('];', start);
  assert.ok(start >= 0 && end > start);
  const cases = JSON.parse(html.slice(start + 'const O3_PILOT = '.length, end + 1));
  for (const n of ['05', '06', '08', '09']) {
    const q = cases.find(item => item.id === 'o3-omdat-' + n);
    assert.ok(q, n);
    assert.equal(q.solutions.length, 2, n);
    const indices = q.solutions.map(solution => solution.join('|'));
    assert.ok(indices.includes('w0|w1|w2|w3|w4'));
    assert.ok(indices.includes('w0|w1|w2|w4|w3'));
  }
});

test('answer reveal is assistance, not a solved exercise', () => {
  const start = html.indexOf('function showAnswer(){');
  const end = html.indexOf('function next(){', start);
  assert.ok(start >= 0 && end > start);
  const reveal = html.slice(start, end);
  assert.match(reveal, /state\.helpUsed=true/);
  assert.match(reveal, /state\.exampleUsed=true/);
  assert.doesNotMatch(reveal, /finishItem\(/);
  assert.match(html, /if\(state\.exampleUsed\)speak\(correctSentence\(\)\)/);
  assert.match(html, /if\(state\.completed&&state\.exampleUsed\)/);
});

test('repeat-instruction button is active with audio on', () => {
  assert.ok(html.includes('${state.audioOn?\'\':\'disabled\'} aria-label="Herhaal de opdracht"'));
  assert.ok(!html.includes('${state.audioOn?\'disabled\':\'\'} aria-label="Herhaal de opdracht"'));
});
