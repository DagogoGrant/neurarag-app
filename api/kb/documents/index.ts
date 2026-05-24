import { VercelRequest, VercelResponse } from '@vercel/node';
import { documentsStore } from '../../_utils/store.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(documentsStore);
  }
  return res.status(405).json({ error: 'Method Not Allowed' });
}
