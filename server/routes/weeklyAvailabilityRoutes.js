import express from 'express';
import {
  getWeeklyAvailabilities,
  getMyWeeklyAvailability,
  submitWeeklyAvailability,
  updateWeeklyAvailabilityStatus
} from '../controllers/weeklyAvailabilityController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getWeeklyAvailabilities);
router.get('/mine', protect, getMyWeeklyAvailability);
router.post('/', protect, submitWeeklyAvailability);
router.patch('/:id/status', protect, adminOnly, updateWeeklyAvailabilityStatus);

export default router;
