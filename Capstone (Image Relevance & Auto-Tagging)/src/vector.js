export function tokenize(value) {
  return new Set(value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean));
}

export function embedding(value) {
  const vector = new Array(128).fill(0);
  for (const token of tokenize(value)) {
    let hash = 2166136261;
    for (const character of token) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
    vector[Math.abs(hash) % vector.length] += 1;
  }
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  return magnitude ? vector.map((value) => value / magnitude) : vector;
}

export function cosineSimilarity(left, right) {
  const denominator = Math.sqrt(left.reduce((sum, value) => sum + value * value, 0))
    * Math.sqrt(right.reduce((sum, value) => sum + value * value, 0));
  return denominator ? left.reduce((sum, value, index) => sum + value * right[index], 0) / denominator : 0;
}
