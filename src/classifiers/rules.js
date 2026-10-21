// Rule-based meme classifier. predict(features) → { label, scores }
export function predict(features) {
  return { label: 'neutral', scores: { neutral: 1 } };
}
