import { cancelBookingCondition, createBookingCondition } from '../services/checkers.js';
import { getBookingById, getEventById, getEventIdByBookingId, getTicketForEvent, getUserById } from '../services/getters.js';
import { cancelBooking, createBooking } from '../models/bookingModel.js';
export const createBookingCtrl = async (req, res, next) => {
    try {
        const { user_id, event_id, quantity } = req.paramsParsed;
        if (!user_id || !event_id || !quantity) {
            return res.status(400).json({ error: 'No user_id/event_id/quantityId' });
        }
        const event = await getEventById(event_id);
        if (!event || event.id === undefined) {
            return res.status(404).json({ error: 'Event not found' });
        }
        const ticket = await getTicketForEvent(event_id);
        if (!ticket || ticket.id === undefined) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        const condition = await createBookingCondition(ticket.id, user_id, quantity);
        if (!condition) {
            return res.status(412).json({
                error: 'Booking conditions not met',
                conditions: '1. This Event has to have enough tickets for quantity requested \n2. User has to have sufficient funds \n3. that this Event has not passed'
            });
        }
        ;
        const result = await createBooking(user_id, event_id, ticket.id, quantity);
        return res.status(200).json({ success: true, result: result });
    }
    catch (e) {
        next(e);
    }
};
export const cancelBookingCtrl = async (req, res, next) => {
    try {
        const values = req.paramsParsed;
        if (!values.user_id || !values.booking_id) {
            return res.status(400).json({ error: 'No user_id/event_id/quantity' });
        }
        const user_id = values.user_id;
        const bookingId = values.booking_id;
        const sameUserId = req.user.id === user_id;
        if (!sameUserId) {
            return res.status(403).json({ error: 'Cannot cancel booking for another user' });
        }
        const validBooking = await getBookingById(bookingId);
        const validUser = await getUserById(user_id);
        const eventId = await getEventIdByBookingId(bookingId);
        if (!validBooking || !eventId) {
            return res.status(404).json({ error: 'Invalid booking ID' });
        }
        if (!validUser) {
            return res.status(404).json({ error: 'Invalid user ID' });
        }
        const canCancel = await cancelBookingCondition(eventId, user_id, bookingId);
        if (!canCancel || canCancel === null) {
            return res.status(412).json({
                error: 'Cancel booking conditions not met',
                conditions: '1. This booking is less than 24H away\n2. User owns selected booking'
            });
        }
        await cancelBooking(bookingId, user_id);
        return res.status(200).json({ success: true, message: 'Booking has been canceled' });
    }
    catch (e) {
        next(e);
    }
};
