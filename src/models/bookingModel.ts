import db from '../config/db.js';
import { Bookings, Ticket } from '../config/typesAndInterfaces.js';

export const createBooking = async(userId: number, eventId: number, ticketId: number, quantity: number = 1): Promise<Bookings> => {
  return await db.tx(async t => {
    await t.none('update tickets set quantity_available = quantity_available - $1 where id = $2 and quantity_available >= $1', [quantity, ticketId]);
    const priceRow = await t.oneOrNone<{ price: number }>('select price from tickets where id = $1', [ticketId]);
    const price = priceRow ? priceRow.price : 0;
    await t.none('update users set wallet = wallet - $1 where id = $2', [price * quantity, userId]);
    const query = 'insert into bookings (user_id, event_id, ticket_id, quantity) values ($1, $2, $3, $4) returning *';
    return await t.one<Bookings>(query, [userId, eventId, ticketId, quantity]);
  });
}

export const cancelBooking = async(bookingId: number, userId: number): Promise<void> => {
  return await db.tx(async t => {
    const bookings = await t.oneOrNone<Bookings>('select * from bookings where id = $1 and user_id = $2', [bookingId, userId]);
    if (!bookings) throw new Error('Booking not found');
    const ticket = await t.oneOrNone<Ticket>('select * from tickets where id = $1', [bookings.ticket_id]);
    await t.none('delete from bookings where id = $1', [bookingId]);
    await t.none('update tickets set quantity_available = quantity_available + $1 where id = $2', [bookings.quantity, bookings.ticket_id]);
    if (ticket) {
      await t.none('update users set wallet = wallet + $1 where id = $2', [ticket.price, userId]);
    }
  });
}



