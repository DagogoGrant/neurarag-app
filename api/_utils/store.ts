export interface IngestedDocument {
  id: string;
  name: string;
  size: string;
  status: string;
  chunksCount: number;
  addedAt: string;
  text?: string;
  chunks?: string[];
}

export function splitTextIntoChunks(text: string, chunkSize: number = 512, overlap: number = 128): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const chunkWords = words.slice(i, i + chunkSize);
    chunks.push(chunkWords.join(" "));
    i += chunkSize - overlap;
    if (chunkSize <= overlap) break;
  }
  return chunks;
}

// Global in-memory store for serverless functions (clears on cold start)
export const documentsStore: IngestedDocument[] = [
  { 
    id: '1', 
    name: 'neural_embeddings_v3.pdf', 
    size: '2.4 MB', 
    status: 'Indexed', 
    chunksCount: 3, 
    addedAt: '2026-05-23',
    text: `Neural Embeddings Section 4.1: Deep dual-encoder models map sentence fragments to a shared vector space, ensuring similarity is equivalent to standard inner product computations. Vector similarity search uses Maximum Inner Product Search (MIPS) algorithms to quickly extract context from dense indexes. High precision encoders convert raw unstructured text paragraphs into 1536-dimensional vectors for semantic matching.`,
    chunks: [
      "Neural Embeddings Section 4.1: Deep dual-encoder models map sentence fragments to a shared vector space, ensuring similarity is equivalent to standard inner product computations.",
      "Vector similarity search uses Maximum Inner Product Search (MIPS) algorithms to quickly extract context from dense indexes.",
      "High precision encoders convert raw unstructured text paragraphs into 1536-dimensional vectors for semantic matching."
    ]
  },
  { 
    id: '2', 
    name: 'rag_architectures_enterprise.txt', 
    size: '412 KB', 
    status: 'Indexed', 
    chunksCount: 2, 
    addedAt: '2026-05-21',
    text: `Retrieval-Augmented Generation models query dense representations using MIPS search before passing contextual outputs into autoregressive decoders. This allows static large language models to maintain access to real-time, external, verified factual data sources, minimizing hallucinations.`,
    chunks: [
      "Retrieval-Augmented Generation models query dense representations using MIPS search before passing contextual outputs into autoregressive decoders.",
      "This allows static large language models to maintain access to real-time, external, verified factual data sources, minimizing hallucinations."
    ]
  },
  { 
    id: '3', 
    name: 'memqa_session_store.doc', 
    size: '1.1 MB', 
    status: 'Indexed', 
    chunksCount: 1, 
    addedAt: '2026-05-18',
    text: `Workspaces configured with memory nodes preserve recent agent evaluations to bypass dense indexing latency for repetitive prompt intents, aligning contexts recursively.`,
    chunks: [
      "Workspaces configured with memory nodes preserve recent agent evaluations to bypass dense indexing latency for repetitive prompt intents, aligning contexts recursively."
    ]
  }
];

export function getQueryRelevantChunks(query: string, topK: number = 3, minScore: number = 0.05): { chunk: string; source: string; score: number }[] {
  const allChunks: { chunk: string; source: string }[] = [];
  documentsStore.forEach(doc => {
    const docChunks = doc.chunks || (doc.text ? splitTextIntoChunks(doc.text) : []);
    docChunks.forEach(chunk => {
      allChunks.push({ chunk, source: doc.name });
    });
  });

  if (allChunks.length === 0) return [];

  const queryTokens = query.toLowerCase().match(/\w+/g) || [];
  if (queryTokens.length === 0) return [];

  const scoredChunks = allChunks.map(item => {
    const chunkTokens = item.chunk.toLowerCase().match(/\w+/g) || [];
    const chunkFreqs: Record<string, number> = {};
    chunkTokens.forEach(t => {
      chunkFreqs[t] = (chunkFreqs[t] || 0) + 1;
    });

    let dotProduct = 0;
    queryTokens.forEach(token => {
      if (chunkFreqs[token]) {
        dotProduct += chunkFreqs[token];
      }
    });

    let chunkLengthSq = 0;
    Object.values(chunkFreqs).forEach(v => {
      chunkLengthSq += v * v;
    });

    let queryLengthSq = queryTokens.length; 
    let score = 0;
    if (chunkLengthSq > 0 && queryLengthSq > 0) {
      score = dotProduct / (Math.sqrt(chunkLengthSq) * Math.sqrt(queryLengthSq));
    }

    return { chunk: item.chunk, source: item.source, score };
  });

  scoredChunks.sort((a, b) => b.score - a.score);
  return scoredChunks.filter(item => item.score >= minScore).slice(0, topK);
}
