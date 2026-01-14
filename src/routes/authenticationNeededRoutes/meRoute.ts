import express from "express";
import { authenticateUser } from "../../middleware/authMiddleware.js";
import { deleteUserCtrl, editUserCtrl, getMyEventsAndBookingsCtrl, getMyInfo } from "../../controllers/UserCtrl.js";
import { addFundsCtrl } from "../../controllers/paymentCtrl.js";
import { validateBody, validateParams } from "../../middleware/validationMiddleware.js";
import { DeleteUserSchemaBody, editUserSchema, IdSchema, PaymentSchemaBody } from "../../config/schemas.js";

const router = express.Router();

router.get('/', authenticateUser, getMyInfo);
router.get('/events', authenticateUser, getMyEventsAndBookingsCtrl);

router.put('/payme', authenticateUser, validateBody(PaymentSchemaBody), addFundsCtrl);

router.put('/:id', authenticateUser, validateParams(IdSchema), validateBody(editUserSchema), editUserCtrl);
router.delete('/:id', authenticateUser, validateParams(IdSchema), validateBody(DeleteUserSchemaBody), deleteUserCtrl);

export default router;