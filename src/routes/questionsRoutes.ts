import { Router } from 'express';
import * as QuestionController from '../controllers/questionController';
import { authMiddleware } from '../security/authMiddleware';
import { requireRole } from '../security/requireRole';

const router = Router();

router.put('/:questionId', authMiddleware, requireRole('ADMIN'), QuestionController.update);
router.delete('/:questionId', authMiddleware, requireRole('ADMIN'), QuestionController.remove);

export default router;
