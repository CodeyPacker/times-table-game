import test from 'node:test';
import assert from 'node:assert/strict';
import { question, swipeDirection, remainingSeconds } from './game.js';
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
