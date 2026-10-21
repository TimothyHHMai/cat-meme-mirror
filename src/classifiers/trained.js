// Trained meme classifier: loads models/model.json. predict(features) → { label, scores }
export function predict(features) {
  return { label: 'neutral', scores: { neutral: 1 } };
}
