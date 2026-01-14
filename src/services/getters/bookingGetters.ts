import db from "../../config/db.js";
import { Bookings, Ticket } from "../../config/typesAndInterfaces.js";

//                                   BOOKINGS AND TICKETS
//===============================================================================================
export const getBookingById = async(id: number): Promise<Bookings | null> => {
  return await db.oneOrNone('select * from bookings where id = $1', [id]);
}

//===============================================================================================

export const getBookingsMadeByUser = async(userId: number): Promise<Bookings[] | null> => {
  return await db.manyOrNone('select * from bookings where user_id = $1', [userId]);
}

//===============================================================================================

export const getTicketsById = async(id: number): Promise<Ticket | null> => {
  return await db.oneOrNone('select * from tickets where id = $1', [id]);
}

//===============================================================================================

export const getTicketForEvent = async(eventId: number): Promise<Ticket | null> => {
  return await db.oneOrNone('select * from tickets where event_id = $1', [eventId]);
}