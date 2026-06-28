import express from 'express';
import {
  createConstraint,
  getConstraints,
  updateConstraintStatus,
  getConstraintsSummary
} from '../controllers/constraintController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getConstraints).post(protect, createConstraint);
router.get('/summary', protect, adminOnly, getConstraintsSummary);
router.patch('/:id/status', protect, adminOnly, updateConstraintStatus);

export default router;
