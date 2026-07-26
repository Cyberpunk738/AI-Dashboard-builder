/**
 * In-Memory Financial Text Vector Embeddings Engine
 * Runs 100% in browser JavaScript with zero server backend calls.
 */

export interface EmbeddingVector {
  text: string;
  tokens: string[];
  vector: number[];
}

/**
 * Computes a bag-of-words / TF-IDF sparse vector for a given input string
 */
export function computeEmbedding(text: string, vocabulary: string[]): number[] {
  const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/);
  return vocabulary.map((vocabTerm) => {
    return tokens.filter((t) => t.includes(vocabTerm) || vocabTerm.includes(t)).length;
  });
}

/**
 * Computes Cosine Similarity between two numeric vectors
 * cosine_sim = (A · B) / (||A|| * ||B||)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
