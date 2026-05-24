import { VercelRequest, VercelResponse } from '@vercel/node';
import { documentsStore, splitTextIntoChunks, IngestedDocument } from '../_utils/store.js';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { name, size, text, isBinary, chunkSize, overlap } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: "Filename is required" });
  }

  try {
    let fileText = text || "";
    
    // Serverless-safe PDF simulation to prevent Vercel crashes
    if (isBinary && name.toLowerCase().endsWith(".pdf")) {
      fileText = `[Extracted Text from ${name}]\nThis is a serverless-safe simulated extraction of the PDF content for demonstration purposes. In a full production environment, this would be processed by a dedicated microservice to bypass serverless execution limits.`;
    }

    const chunks = splitTextIntoChunks(fileText, chunkSize || 512, overlap || 128);

    const newDoc: IngestedDocument = {
      id: String(documentsStore.length + 1),
      name: name,
      size: size || `${Math.ceil(fileText.length / 1024)} KB`,
      status: 'Indexed',
      chunksCount: chunks.length,
      addedAt: new Date().toISOString().split('T')[0],
      text: fileText,
      chunks: chunks
    };
    
    documentsStore.unshift(newDoc);
    return res.status(200).json({ success: true, document: newDoc });

  } catch (err: any) {
    console.error("File ingestion error:", err);
    return res.status(500).json({ error: `File parsing failed: ${err.message || err}` });
  }
}
