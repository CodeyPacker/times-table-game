export function question(max, previous, random = Math.random) {
  // Select uniformly from all pairs except the previous one, when possible.
  const count = max * max;
  const prior = previous ? (previous.a - 1) * max + previous.b - 1 : -1;
  let index = Math.floor(random() * (count - (prior >= 0 && count > 1 ? 1 : 0)));
  if (count > 1 && prior >= 0 && index >= prior) index++;
  return { a: Math.floor(index / max) + 1, b: index % max + 1 };
}
export function swipeDirection(x, y, mode) {
  if (mode === 'duo' && y < -85 && Math.abs(y) > Math.abs(x)) return 'tie';
  if (Math.abs(x) > 85 && Math.abs(x) > Math.abs(y)) return x < 0 ? 'left' : 'right';
  return null;
}
export function remainingSeconds(deadline, now = Date.now()) {
  return deadline === null ? null : Math.max(0, Math.ceil((deadline - now) / 1000));
}

export function knowledgeQuestions(min, max, randomized = false, random = Math.random) {
  const questions = [];
  for (let a = min; a <= max; a++) {
    for (let b = a; b <= max; b++) questions.push({ a, b });
  }
  if (randomized) {
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
  }
  return questions;
}
