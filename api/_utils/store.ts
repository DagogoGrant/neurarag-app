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

export function splitTextSlidingWindow(text: string, chunkSize: number = 512, overlap: number = 128): string[] {
  const words = text.split(/\s+/).filter(Boolean);
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

export function splitTextRecursively(
  text: string, 
  chunkSize: number, 
  overlap: number, 
  separators: string[] = ["\n\n", "\n", ". ", " "]
): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length <= chunkSize) {
    return [trimmed];
  }

  let separator = "";
  let parts: string[] = [];
  for (const s of separators) {
    const splitParts = trimmed.split(s);
    if (splitParts.length > 1) {
      separator = s;
      parts = splitParts;
      break;
    }
  }

  if (!separator) {
    return splitTextSlidingWindow(trimmed, chunkSize, overlap);
  }

  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentChunkWordsCount = 0;

  for (const part of parts) {
    const cleanPart = part.trim();
    if (!cleanPart) continue;
    
    const partWords = cleanPart.split(/\s+/).filter(Boolean);
    const partWordsCount = partWords.length;

    if (partWordsCount > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(separator).trim());
        currentChunk = [];
        currentChunkWordsCount = 0;
      }
      const remainingSeparators = separators.slice(separators.indexOf(separator) + 1);
      const subChunks = splitTextRecursively(cleanPart, chunkSize, overlap, remainingSeparators);
      chunks.push(...subChunks);
    } else {
      if (currentChunkWordsCount + partWordsCount > chunkSize) {
        chunks.push(currentChunk.join(separator).trim());
        
        let overlapChunk: string[] = [];
        let overlapWordsCount = 0;
        for (let j = currentChunk.length - 1; j >= 0; j--) {
          const wCount = currentChunk[j].split(/\s+/).filter(Boolean).length;
          if (overlapWordsCount + wCount <= overlap) {
            overlapChunk.unshift(currentChunk[j]);
            overlapWordsCount += wCount;
          } else {
            break;
          }
        }
        currentChunk = overlapChunk;
        currentChunkWordsCount = overlapWordsCount;
      }
      
      currentChunk.push(cleanPart);
      currentChunkWordsCount += partWordsCount;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(separator).trim());
  }

  return chunks.filter(Boolean);
}

export function splitTextIntoChunks(text: string, chunkSize: number = 512, overlap: number = 128): string[] {
  try {
    const recursiveChunks = splitTextRecursively(text, chunkSize, overlap);
    if (recursiveChunks.length > 0) {
      return recursiveChunks;
    }
  } catch (error) {
    console.error("Recursive chunking failed, falling back to sliding-window:", error);
  }
  return splitTextSlidingWindow(text, chunkSize, overlap);
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
