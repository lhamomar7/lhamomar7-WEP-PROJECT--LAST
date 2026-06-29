import express from 'express';
import { getUsers } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', protect, adminOnly, getUsers);
export default router;
