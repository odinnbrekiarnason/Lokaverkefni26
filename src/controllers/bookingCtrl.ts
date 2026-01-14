import { NextFunction, Request, Response } from 'express'
import { cancelBookingCondition, createBookingCondition } from '../services/checkers.js';
import { getBookingById, getTicketForEvent } from '../services/getters/bookingGetters.js';
import { getEventById, getEventIdByBookingId } from '../services/getters/eventGetters.js';
import { getUserById } from '../services/getters/userGetters.js';
import { cancelBooking, createBooking } from '../models/bookingModel.js';
import { CreateBookingType, DeleteBookingType } from '../config/schemas.js';

export const createBookingCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { event_id, quantity }: CreateBookingType = req.paramsParsed;
    const userId = req.user?.id;

    if(!userId || userId! === 0) {
      return res.status(401).json({error: 'Must be logged in to continue'});
    }

    if(!event_id || !quantity) {
      return res.status(400).json({error: 'No event_id/quantity'});
    }

    const event = await getEventById(event_id);
    if(!event || event.id === undefined) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const ticket = await getTicketForEvent(event_id);
    if(!ticket || ticket.id === undefined) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    const condition = await createBookingCondition(ticket.id, userId, quantity);
    if (!condition) {
      return res.status(412).json({
        error: 'Booking conditions not met',
        condition_1: 'This Event has to have enough tickets for quantity requested',
        condition_2: 'User has to have sufficient funds',
        condition_3: 'This Event has not passed',
      });
    };

    const result = await createBooking(userId, event_id, ticket!.id, quantity);
    return res.status(200).json({success: true, result: result});
  } catch (e) {
    next(e)
  }
}

export const cancelBookingCtrl = async(req: Request, res: Response, next: NextFunction) => {
  try{
    const values: DeleteBookingType = req.paramsParsed;
    if(!values.user_id || !values.booking_id) {
      return res.status(400).json({error: 'No user_id/event_id'});
    }
    const user_id = values.user_id;
    const bookingId = values.booking_id;

    const sameUserId = req.user!.id === user_id;
    if(!sameUserId) {
      return res.status(403).json({error: 'Cannot cancel booking for another user'});
    }
    
    const validBooking = await getBookingById(bookingId);
    const validUser = await getUserById(user_id);
    const eId = await getEventIdByBookingId(bookingId);
    
    if(!validBooking || !eId) {
      return res.status(404).json({error: 'Invalid booking ID'});
    }
    if(!validUser) {
      return res.status(404).json({error: 'Invalid user ID'});
    }

    const canCancel = await cancelBookingCondition(eId.event_id, user_id, bookingId);
    if(!canCancel || canCancel === null) {
      return res.status(412).json({
        error: 'Cancel booking conditions not met', 
        conditions: '1. This booking is less than 24H away\n2. User owns selected booking'
      });
    }

    await cancelBooking(bookingId, user_id);
    return res.status(200).json({success: true, message: 'Booking has been canceled'});
  } catch(e) {
    next(e);
  }
}