import express from 'express';
import { login, me, register } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
const router = express.Router();
// Only a logged-in manager can create new user accounts — there is no
// public self-signup. This keeps the employee list under manager control.
router.post('/register', protect, adminOnly, register);
router.post('/login', login);
router.get('/me', protect, me);
export default router;
