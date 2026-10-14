// api/sync.js - Automatic Account Cloud Sync Handler for Vercel
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

  // Parse body or query parameters
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {}
  }
  const email = (body?.email || req.query?.email || '').trim().toLowerCase();
  const action = body?.action || req.query?.action || (req.method === 'GET' ? 'pull' : 'push');

  if (!email) {
    return res.status(400).json({ error: 'Email is required for syncing' });
  }

  // Check for Upstash Redis or Vercel KV environment variables
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN;

  const cleanEmail = email.replace(/[^a-z0-9]/g, '_');
  const key = `satify_sync_${cleanEmail}`;

  // Helper to execute Redis command via REST
  async function redisCommand(cmd, ...args) {
    if (!kvUrl || !kvToken) return null;
    try {
      // 1. Try standard command array (Official Upstash / Vercel KV format)
      const response = await fetch(`${kvUrl}/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([cmd, ...args]),
      });
      if (response.ok) {
        const data = await response.json();
        return data.result;
      }

      // 2. Fallback to path format
      if (cmd === 'GET') {
        const getRes = await fetch(`${kvUrl}/get/${encodeURIComponent(args[0])}`, {
          headers: { Authorization: `Bearer ${kvToken}` },
        });
        if (getRes.ok) {
          const raw = await getRes.json();
          return raw.result;
        }
      } else if (cmd === 'SET') {
        const setRes = await fetch(`${kvUrl}/set/${encodeURIComponent(args[0])}`, {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(args[1]),
        });
        if (setRes.ok) {
          const raw = await setRes.json();
          return raw.result;
        }
      }
    } catch (e) {
      console.warn('Redis command error:', e);
    }
    return null;
  }

  if (kvUrl && kvToken) {
    try {
      // 1. Pull action: Read user's cloud data from Redis
      if (action === 'pull') {
        const raw = await redisCommand('GET', key);
        let cloudData = null;
        if (raw) {
          cloudData = typeof raw === 'string' ? JSON.parse(raw) : raw;
        }
        return res.status(200).json({
          success: true,
          email,
          configured: true,
          attempts: cloudData?.attempts || [],
          savedIds: cloudData?.savedIds || [],
          streak: cloudData?.streak || null,
          vocabRatings: cloudData?.vocabRatings || {},
          customDecks: cloudData?.customDecks || [],
          updatedAt: cloudData?.updatedAt || 0,
        });
      }

      // 2. Push / Merge action: Merge incoming data with cloud data
      const incomingAttempts = body?.attempts || [];
      const incomingSaved = body?.savedIds || [];
      const incomingStreak = body?.streak || null;
      const incomingVocab = body?.vocabRatings || {};
      const incomingDecks = body?.customDecks || [];

      // Read existing cloud data
      const raw = await redisCommand('GET', key);
      let existing = null;
      if (raw) {
        existing = typeof raw === 'string' ? JSON.parse(raw) : raw;
      }

      // Merge attempts (keep newer timestamp if duplicate question)
      const map = new Map();
      if (existing?.attempts && Array.isArray(existing.attempts)) {
        for (const a of existing.attempts) map.set(a.questionId, a);
      }
      for (const a of incomingAttempts) {
        const cur = map.get(a.questionId);
        if (!cur || a.timestamp >= cur.timestamp) {
          map.set(a.questionId, a);
        }
      }

      const mergedAttempts = Array.from(map.values());
      const mergedSaved = Array.from(new Set([...(existing?.savedIds || []), ...incomingSaved]));

      // Merge streak
      let mergedStreak = incomingStreak;
      if (existing?.streak) {
        if (!incomingStreak || (existing.streak.streak || 0) > (incomingStreak.streak || 0)) {
          mergedStreak = existing.streak;
        }
      }

      // Merge vocab ratings & decks
      const mergedVocab = { ...(existing?.vocabRatings || {}), ...incomingVocab };
      const deckMap = new Map();
      if (existing?.customDecks && Array.isArray(existing.customDecks)) {
        for (const d of existing.customDecks) deckMap.set(d.id, d);
      }
      if (Array.isArray(incomingDecks)) {
        for (const d of incomingDecks) deckMap.set(d.id, d);
      }
      const mergedDecks = Array.from(deckMap.values());

      const payload = {
        email,
        updatedAt: Date.now(),
        attempts: mergedAttempts,
        savedIds: mergedSaved,
        streak: mergedStreak,
        vocabRatings: mergedVocab,
        customDecks: mergedDecks,
      };

      // Write merged state to KV
      await redisCommand('SET', key, JSON.stringify(payload));

      return res.status(200).json({
        success: true,
        configured: true,
        ...payload,
      });
    } catch (e) {
      console.error('Cloud sync error:', e);
      return res.status(500).json({ error: String(e) });
    }
  }

  // If cloud storage is not connected yet, return client state gracefully
  return res.status(200).json({
    success: true,
    configured: false,
    email,
    attempts: body?.attempts || [],
    savedIds: body?.savedIds || [],
    streak: body?.streak || null,
    message: 'Vercel KV not detected yet. Link your KV store in project storage.',
  });
}
