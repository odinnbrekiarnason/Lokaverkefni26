import express from 'express';
import { getAllEventsCtrl, getOneEventCtrl } from '../../controllers/eventCtrl.js';
import { validateParams, validateQuery } from '../../middleware/validationMiddleware.js';
import { CancelBookingSchema, CreateBookingSchema, eventFiltersSchema, IdSchema } from '../../config/schemas.js';
import { cancelBookingCtrl, createBookingCtrl } from '../../controllers/bookingCtrl.js';
import { authenticateUser } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', validateQuery(eventFiltersSchema), getAllEventsCtrl) 
router.get('/:id', validateParams(IdSchema), getOneEventCtrl);

router.post('/book/:event_id/:quantity', authenticateUser, validateParams(CreateBookingSchema), createBookingCtrl);
router.delete('/cancelBooking/:booking_id/:user_id', authenticateUser, validateParams(CancelBookingSchema), cancelBookingCtrl);


export default router;
  