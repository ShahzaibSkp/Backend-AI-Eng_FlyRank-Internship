import { Router } from 'express';

const router = Router();

router.get('/info', (_req, res) => {
  return res.status(200).json({
    message: 'Welcome stranger! This info is public.'
  });
});

export default router;
