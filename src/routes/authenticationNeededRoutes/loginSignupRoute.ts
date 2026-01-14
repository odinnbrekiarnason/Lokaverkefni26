import express from 'express';
import { validateBody } from '../../middleware/validationMiddleware.js';
import { CreateUserSchema, LoginSchema } from '../../config/schemas.js';
import { login, signup } from '../../controllers/UserCtrl.js';

const router = express.Router();


router.post('/signup', validateBody(CreateUserSchema), signup);
router.post('/login', validateBody(LoginSchema), login);

export default router;
