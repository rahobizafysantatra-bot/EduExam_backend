import { Router } from 'express';
import { CourseController } from '../controllers/CourseController';
import { CourseService } from '../services/CourseService';
import { CourseRepository } from '../repositories/CourseRepository';
import { requireRole } from '../security/requireRole';
import { authMiddleware } from '../security/authMiddleware';

const router = Router();

const courseRepository = new CourseRepository();
const courseService = new CourseService(courseRepository);
const courseController = new CourseController(courseService);

router.get('/courses', authMiddleware, requireRole('ADMIN'), courseController.list);
router.get('/courses/:id', authMiddleware, requireRole('ADMIN'), courseController.getById);
router.post('/courses', authMiddleware, requireRole('ADMIN'), courseController.create);
router.put('/courses/:id', authMiddleware, requireRole('ADMIN'), courseController.update);
router.delete('/courses/:id', authMiddleware, requireRole('ADMIN'), courseController.delete);

export default router;