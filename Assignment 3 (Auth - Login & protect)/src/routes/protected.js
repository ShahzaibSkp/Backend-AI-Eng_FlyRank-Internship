import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/profile', requireAuth, (req, res) => {
  return res.status(200).json({
    id: req.user.id,
    email: req.user.email,
    created_at: req.user.created_at,
    last_sign_in_at: req.user.last_sign_in_at,
    user_metadata: req.user.user_metadata
  });
});

router.get('/dashboard', requireAuth, (req, res) => {
  return res.status(200).json({
    message: 'Welcome to your protected dashboard.',
    user_id: req.user.id
  });
});

export default router;
