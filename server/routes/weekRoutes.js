import express from 'express';
import { getWeeks, getOpenWeek, openWeek, closeWeek } from '../controllers/weekController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getWeeks);
router.get('/open', protect, getOpenWeek);
router.post('/', protect, adminOnly, openWeek);
router.patch('/:id/close', protect, adminOnly, closeWeek);

export default router;
