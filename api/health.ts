import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  res.status(200).json({
    status: 'ok',
    service: 'MarketPulse API',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  })
}
