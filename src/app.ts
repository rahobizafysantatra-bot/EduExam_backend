import express from 'express';
import authRoutes from './routes/authRoutes';
import studentsRoutes from './routes/studentRoutes';
import courseRoutes from './routes/courseRoutes';  
import examRoutes from './routes/examRoutes';
import examQuestionsRoutes from './routes/examQuestionsRoutes';
import questionsRoutes from './routes/questionsRoutes';
import myRoutes from './routes/myRoutes';
import { errorHandler } from './security/errorHandler';
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', studentsRoutes);
app.use('/api', courseRoutes);  
app.use('/api', examRoutes);
app.use('/api', examQuestionsRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/my', myRoutes);

app.use(errorHandler);

export default app;