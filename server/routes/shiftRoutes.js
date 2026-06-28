import express from 'express';
import { createShift, deleteShift, getShiftById, getShifts, getStats, updateShift } from '../controllers/shiftController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All shift routes require login: getShifts/getStats/getShiftById filter
// results to the logged-in user's own shifts unless they're a manager.
router.get('/stats', protect, getStats);
router.route('/').get(protect, getShifts).post(protect, adminOnly, createShift);
router.route('/:id').get(protect, getShiftById).put(protect, adminOnly, updateShift).delete(protect, adminOnly, deleteShift);

export default router;
