import { supabase } from '../config/supabase.js';

export async function requireAuth(req, res, next) {
  const authorization = req.get('Authorization');
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const { data, error } = await supabase.auth.getUser(match[1]);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.accessToken = match[1];
  req.user = data.user;
  return next();
}
