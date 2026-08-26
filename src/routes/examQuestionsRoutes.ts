import { Router } from 'express';
import * as QuestionController from '../controllers/questionController';
import * as AttemptController from '../controllers/attemptController';
import { authMiddleware } from '../security/authMiddleware';
import { requireRole } from '../security/requireRole';

const router = Router();

router.get('/exams/:examId/questions', authMiddleware, requireRole('ADMIN'), QuestionController.list);
router.post('/exams/:examId/questions', authMiddleware, requireRole('ADMIN'), QuestionController.create);
router.get('/exams/:examId/results', authMiddleware, requireRole('ADMIN'), AttemptController.adminExamResults);

export default router;