import { Router } from 'express';
import * as AttemptController from '../controllers/attemptController';
import { authMiddleware } from '../security/authMiddleware';
import { requireRole } from '../security/requireRole';

const router = Router();

router.get('/exams', authMiddleware, requireRole('STUDENT'), AttemptController.listMyExams);
router.get('/exams/:id', authMiddleware, requireRole('STUDENT'), AttemptController.getMyExam);
router.post('/exams/:id/submit', authMiddleware, requireRole('STUDENT'), AttemptController.submitExam);
router.get('/results', authMiddleware, requireRole('STUDENT'), AttemptController.myResults);

export default router;
