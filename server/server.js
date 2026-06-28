import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import shiftRoutes from './routes/shiftRoutes.js';
import constraintRoutes from './routes/constraintRoutes.js';
import userRoutes from './routes/userRoutes.js';
import externalRoutes from './routes/externalRoutes.js';
import weekRoutes from './routes/weekRoutes.js';
import weeklyAvailabilityRoutes from './routes/weeklyAvailabilityRoutes.js';
import { rolloverWeeksIfNeeded } from './controllers/weekController.js';

dotenv.config();
await connectDB();

// Ensure there is always exactly one open week as soon as the server
// starts, closing any week whose end date has already passed.
await rolloverWeeksIfNeeded();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.use(express.static(path.join(__dirname, '..')));
app.get('/health', (req, res) => res.json({ success: true, message: 'ShiftPlan API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/constraints', constraintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/weeks', weekRoutes);
app.use('/api/weekly-availability', weeklyAvailabilityRoutes);

app.use(notFound);
app.use(errorHandler);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
