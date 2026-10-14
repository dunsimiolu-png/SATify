// api/sync.js - Serverless Cloud Sync Handler for Vercel
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {}
  }
  const { email, attempts, savedIds, streak } = body || {};

  if (!email) {
    return res.status(400).json({ error: 'Email is required for syncing' });
  }

  // Check for Upstash Redis or Vercel KV environment variables
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (kvUrl && kvToken) {
    try {
      const cleanEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const key = `satify_sync_${cleanEmail}`;

      if (req.method === 'POST') {
        // Read existing cloud data first
        const getRes = await fetch(`${kvUrl}/get/${key}`, {
          headers: { Authorization: `Bearer ${kvToken}` },
        });
        let existing = null;
        if (getRes.ok) {
          const raw = await getRes.json();
          if (raw.result) {
            existing = typeof raw.result === 'string' ? JSON.parse(raw.result) : raw.result;
          }
        }

        // Merge incoming with existing
        const map = new Map();
        if (existing?.attempts && Array.isArray(existing.attempts)) {
          for (const a of existing.attempts) map.set(a.questionId, a);
        }
        if (attempts && Array.isArray(attempts)) {
          for (const a of attempts) {
            const cur = map.get(a.questionId);
            if (!cur || a.timestamp >= cur.timestamp) {
              map.set(a.questionId, a);
            }
          }
        }

        const mergedAttempts = Array.from(map.values());
        const mergedSaved = Array.from(new Set([...(existing?.savedIds || []), ...(savedIds || [])]));
        const mergedStreak = Math.max(existing?.streak || 0, streak || 0);

        const payload = {
          email,
          updatedAt: Date.now(),
          attempts: mergedAttempts,
          savedIds: mergedSaved,
          streak: mergedStreak,
        };

        // Write to KV
        await fetch(`${kvUrl}/set/${key}`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify([key, JSON.stringify(payload)]),
        });

        return res.status(200).json(payload);
      }
    } catch (e) {
      console.error('Cloud KV sync error:', e);
      return res.status(500).json({ error: String(e) });
    }
  }

  // If external database is not yet configured, return notice with current client state
  return res.status(200).json({
    synced: false,
    message: 'To enable automated background cloud sync, add UPSTASH_REDIS_REST_URL in your Vercel Environment Variables.',
    attempts: attempts || [],
    savedIds: savedIds || [],
  });
}
