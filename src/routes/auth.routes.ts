import express from 'express';
import { login, register } from '../controllers/auth.controller';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { authMiddleware, validateBody } from '../middlewares/auth.middleware';
import { requireRoles } from '../middlewares/role.middleware';

const router = express.Router();

router.post('/login', validateBody(loginSchema), login);

// SOLO admin puede registrar nuevos usuarios:
router.post('/register', authMiddleware, requireRoles(['admin']), validateBody(registerSchema), register);

export default router;
