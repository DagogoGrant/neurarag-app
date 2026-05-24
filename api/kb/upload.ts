import { VercelRequest, VercelResponse } from '@vercel/node';
import pdfParse from 'pdf-parse';
import { documentsStore, splitTextIntoChunks, IngestedDocument } from '../_utils/store';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
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
    if (isBinary && name.toLowerCase().endsWith(".pdf")) {
      const buffer = Buffer.from(text, "base64");
      const data = await pdfParse(buffer);
      fileText = data.text || "";
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
