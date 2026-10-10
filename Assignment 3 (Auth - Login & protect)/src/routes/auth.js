import { Router } from 'express';
import { createTokenClient, supabase } from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function hasCredentials(body) {
  return typeof body?.email === 'string' &&
    body.email.trim() &&
    typeof body?.password === 'string' &&
    body.password.trim();
}

function getUserMetadata(body) {
  if (body?.metadata === undefined) {
    return undefined;
  }

  if (
    body.metadata === null ||
    typeof body.metadata !== 'object' ||
    Array.isArray(body.metadata)
  ) {
    return null;
  }

  return body.metadata;
}

router.post('/signup', async (req, res, next) => {
  if (!hasCredentials(req.body)) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const metadata = getUserMetadata(req.body);
  if (metadata === null) {
    return res.status(400).json({ error: 'Metadata must be a JSON object' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: req.body.email.trim(),
      password: req.body.password,
      options: metadata === undefined ? undefined : { data: metadata }
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ user: data.user, session: data.session });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  if (!hasCredentials(req.body)) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: req.body.email.trim(),
      password: req.body.password
    });

    if (error) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    return res.status(200).json({
      user: data.user,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      token_type: data.session.token_type,
      expires_in: data.session.expires_in,
      expires_at: data.session.expires_at
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const tokenClient = createTokenClient(req.accessToken);
    const { error } = await tokenClient.auth.signOut();

    if (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;
