import express from 'express';
import { getIsraelHolidays } from '../controllers/externalController.js';
const router = express.Router();
router.get('/holidays', getIsraelHolidays);
export default router;
