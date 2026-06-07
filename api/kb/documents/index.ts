import { VercelRequest, VercelResponse } from '@vercel/node';
import { documentsStore } from '../../_utils/store.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(documentsStore);
  }
  if (req.method === 'DELETE') {
    const { id } = req.body || req.query || {};
    const idx = documentsStore.findIndex(d => d.id === id);
    if (idx !== -1) {
      documentsStore.splice(idx, 1);
    }
    return res.status(200).json({ success: true });
  }
  return res.status(405).json({ error: 'Method Not Allowed' });
}
