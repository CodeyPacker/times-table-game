import test from 'node:test';
import assert from 'node:assert/strict';
import { question, swipeDirection, remainingSeconds, knowledgeQuestions } from './game.js';
test('questions stay within every selected boundary and avoid immediate repeats', () => {
  for (let max = 1; max <= 12; max++) {
    let previous;
    for (let i = 0; i < 500; i++) {
      const next = question(max, previous);
      assert.ok(next.a >= 1 && next.a <= max && next.b >= 1 && next.b <= max);
      if (max > 1 && previous) assert.notDeepEqual(next, previous);
      assert.ok(next.a * next.b <= max * max);
      previous = next;
    }
  }
});
test('swipes require a deliberate movement and respect player modes', () => {
  assert.equal(swipeDirection(-100, 0, 'solo'), 'left');
  assert.equal(swipeDirection(100, 0, 'duo'), 'right');
  assert.equal(swipeDirection(20, -100, 'duo'), 'tie');
  assert.equal(swipeDirection(20, -100, 'solo'), null);
  assert.equal(swipeDirection(30, 20, 'solo'), null);
  assert.equal(swipeDirection(20, 100, 'duo'), null);
});
test('timer uses wall clock, rounds up, and never goes below zero', () => {
  assert.equal(remainingSeconds(61000, 1000), 60);
  assert.equal(remainingSeconds(61000, 60500), 1);
  assert.equal(remainingSeconds(61000, 62000), 0);
  assert.equal(remainingSeconds(null, 62000), null);
});

test('knowledge tests cover every unique pair in every supported range', () => {
  for (let min = 1; min <= 12; min++) {
    for (let max = min; max <= 12; max++) {
      const deck = knowledgeQuestions(min, max);
      const size = max - min + 1;
      assert.equal(deck.length, size * (size + 1) / 2);
      const pairs = new Set(deck.map(({a, b}) => `${a},${b}`));
      assert.equal(pairs.size, deck.length);
      for (let a = min; a <= max; a++) {
        for (let b = min; b <= max; b++) {
          assert.ok(pairs.has(`${Math.min(a, b)},${Math.max(a, b)}`));
        }
      }
      assert.deepEqual(deck[0], {a:min, b:min});
      assert.deepEqual(deck.at(-1), {a:max, b:max});
      assert.deepEqual(deck, [...deck].sort((x, y) => x.a - y.a || x.b - y.b));
    }
  }
});
test('randomized knowledge tests preserve all pairs and change their order', () => {
  const ordered = knowledgeQuestions(7, 9);
  const shuffled = knowledgeQuestions(7, 9, true, () => 0);
  assert.notDeepEqual(shuffled, ordered);
  const key = ({a, b}) => `${a},${b}`;
  assert.deepEqual(shuffled.map(key).sort(), ordered.map(key).sort());
  assert.deepEqual(knowledgeQuestions(8, 8, true), [{a:8, b:8}]);
});
