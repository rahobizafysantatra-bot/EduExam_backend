import { Router } from 'express';
import { ExamController } from '../controllers/examController';
import { ExamService } from '../services/ExamService';
import { ExamRepository } from '../repositories/examRepository';
import { CourseRepository } from '../repositories/courseRepository';
import { authMiddleware } from '../security/authMiddleware';
import { requireRole } from '../security/requireRole';

const router = Router();

const examRepository = new ExamRepository();
const courseRepository = new CourseRepository();
const examService = new ExamService(examRepository, courseRepository);
const examController = new ExamController(examService);

router.get('/exams', authMiddleware, requireRole('ADMIN'), examController.list);
router.get('/exams/:id', authMiddleware, requireRole('ADMIN'), examController.getById);
router.post('/exams', authMiddleware, requireRole('ADMIN'), examController.create);
router.put('/exams/:id', authMiddleware, requireRole('ADMIN'), examController.update);
router.delete('/exams/:id', authMiddleware, requireRole('ADMIN'), examController.delete);

export default router;