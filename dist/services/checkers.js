import db from '../config/db.js';
import { getEventDate } from './getters.js';
//===============================================================================================
//
//                                          TICKET CHECKERS
//
//===============================================================================================
export const checkTicketAvailability = async (ticketId, quantity = 1) => {
    const row = await db.oneOrNone('select quantity_available from tickets where id = $1', [ticketId]);
    if (!row)
        return false;
    const qty = row.quantity_available ? row.quantity_available : false;
    if (qty >= 1) {
        return qty >= quantity;
    }
    return false;
};
//===============================================================================================
//
//                                          EVENT CHECKERS                  
//
//===============================================================================================
export const cancelBookingCondition = async (eventId, userId, bookingId) => {
    const eventRow = await db.oneOrNone('select date from events where id = $1', [eventId]);
    if (!eventRow || !eventRow.date)
        return false;
    const eventDate = new Date(eventRow.date);
    const ownsBooking = await doesUserOwnBooking(userId, bookingId);
    if (!ownsBooking)
        return false;
    const now = Date.now();
    const diffMs = eventDate.getTime() - now;
    if (diffMs <= 0)
        return false;
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    return diffMs > twentyFourHoursMs;
};
//===============================================================================================
//
//                                          BOOKING CHECKERS                  
//
//===============================================================================================
export const createBookingCondition = async (ticketId, userId, quantity = 1) => {
    const ticketsAvailable = await checkTicketAvailability(ticketId, quantity);
    const cashRow = await db.oneOrNone('select wallet from users where id = $1', [userId]);
    const costRow = await db.oneOrNone('select price from tickets where id = $1', [ticketId]);
    const eventIdRow = await db.oneOrNone('select event_id from tickets where id = $1', [ticketId]);
    if (!cashRow || !costRow || !eventIdRow)
        return false;
    const cash = cashRow.wallet;
    const cost = costRow.price;
    const inTime = await getEventDate(eventIdRow.event_id);
    const timeNow = new Date();
    if (ticketsAvailable && cash > cost && timeNow < inTime) {
        return true;
    }
    return false;
};
//===============================================================================================
export const doesUserOwnBooking = async (userId, bookingId) => {
    const booking = await db.oneOrNone('select * from bookings where user_id = $1 and id = $2', [userId, bookingId]);
    return !!booking;
};
