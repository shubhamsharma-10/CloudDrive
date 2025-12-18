import { Router } from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import authController from '../controllers/auth.controller.js';

const authRouter = Router();

authRouter.post('/login', authController.login)
authRouter.post('/register', authController.register)
authRouter.get('/me', authMiddleware, authController.getMe)

export default authRouter;