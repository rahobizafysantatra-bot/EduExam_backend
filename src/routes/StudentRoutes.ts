import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { UserService } from '../services/UserService';
import { UserRepository } from '../repositories/UserRepository';
import { authMiddleware } from '../security/authMiddleware';
import { requireRole } from '../security/requireRole';

const router = Router();

const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get('/students', authMiddleware, requireRole('ADMIN'), userController.list);
router.post('/students', authMiddleware, requireRole('ADMIN'), userController.create);
router.put('/students/:id', authMiddleware, requireRole('ADMIN'), userController.update);
router.put('/students/:id/reset-password', authMiddleware, requireRole('ADMIN'), userController.resetPassword);
router.delete('/students/:id', authMiddleware, requireRole('ADMIN'), userController.deactivate);

export default router;