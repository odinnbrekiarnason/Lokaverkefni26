import express from 'express';
import { validateParams } from '../../middleware/validationMiddleware.js';
import { getAllVenuesCtrl, getEventsByVenueCtrl, getOneVenueCtrl } from '../../controllers/eventCtrl.js';
import { IdSchema } from '../../config/schemas/schemas.js';
const router = express.Router();
router.get('/', getAllVenuesCtrl);
router.get('/:id', validateParams(IdSchema), getOneVenueCtrl);
router.get('/:id/events', validateParams(IdSchema), getEventsByVenueCtrl);
export default router;
