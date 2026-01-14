import express from 'express';
import { validateBody, validateParams } from '../../middleware/validationMiddleware.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';
import { PaymentSchemaBody, IdSchema } from '../../config/schemas/schemas.js';
import { addFundCtrl } from '../../controllers/paymentCtrl.js';
const router = express.Router();
// normalize `userId` param to `id` so `IdSchema` (which expects `id`) validates correctly
const normalizeUserIdParam = (req, _res, next) => {
    if (req.params && req.params.userId)
        req.params.id = req.params.userId;
    next();
};
router.post('/:userId', authenticateUser, normalizeUserIdParam, validateBody(PaymentSchemaBody), validateParams(IdSchema), addFundCtrl);
export default router;
