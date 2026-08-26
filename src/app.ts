import express from 'express';
import authRoutes from './routes/authRoutes';
import studentsRoutes from './routes/studentRoutes';
import examRoutes from './routes/examRoutes';
import examQuestionsRoutes from './routes/examQuestionsRoutes';
import questionsRoutes from './routes/questionsRoutes';
import myRoutes from './routes/myRoutes';
import { errorHandler } from './security/errorHandler';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', studentsRoutes);
app.use('/api', examRoutes);
app.use('/api', examQuestionsRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/my', myRoutes);

app.use(errorHandler);

export default app;