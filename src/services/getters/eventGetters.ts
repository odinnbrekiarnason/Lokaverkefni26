import db from "../../config/db.js";
import { EventFilters } from "../../config/schemas.js";
import { Event } from "../../config/typesAndInterfaces.js";

export const getAllEvents = async(filters?: EventFilters) => {
  if (!filters) {
    return await db.manyOrNone(`
      select e.*, v.address as venue_address, v.city as venue_city
      from events e
      join venues v on e.venue_id = v.id
      where e.date >= now()
      order by e.date asc
    `);
  }

  const query = [];
  const values = [];
  let idx = 1;

  if (filters.category !== undefined) {
    query.push(`e.category_id = $${idx++}`);
    values.push(filters.category);
  }

  if (filters.dateFrom !== undefined) {
    query.push(`e.date >= $${idx++}`);
    values.push(filters.dateFrom);
  }

  if (filters.dateTo !== undefined) {
    query.push(`e.date <= $${idx++}`);
    values.push(filters.dateTo);
  }

  if (filters.venueId !== undefined) {
    query.push(`e.venue_id = $${idx++}`);
    values.push(filters.venueId);
  }

  if (filters.city !== undefined) {
    query.push(`v.city ilike $${idx++}`);
    values.push(`%${filters.city}%`);
  }

  const allowedSorts = ['date', 'price', 'popularity'];
  const sort = filters.sort && allowedSorts.includes(filters.sort) ? filters.sort : 'date';
  const order = filters.order === 'desc' ? 'desc' : 'asc';

  const whereSql = query.length ? 'and ' + query.join(' and ') : '';
  let sql = `select e.*, v.address as venue_address, v.city as venue_city
  from events e 
  join venues v on e.venue_id = v.id 
  where e.date >= now() ${whereSql} order by e.${sort} ${order}`;

  if (filters.page && filters.limit) {
    const pagination = (filters.page - 1) * filters.limit;
    sql += ` OFFSET $${idx++} LIMIT $${idx++}`;
    values.push(pagination, filters.limit);
  }

  const result = await db.manyOrNone(sql, values);
  return result;
}
//===============================================================================================
export const getEventById = async(eventId: number): Promise<Event | null> => {
  return await db.oneOrNone('select * from events where id = $1', [eventId]);
}
//===============================================================================================
export const getEventInfoById = async(eventId: number) => {
  return await db.oneOrNone(`select e.*, v.address as venue_address, v.city as venueÖ_city, t.price, t.quantity_available`)
}
//===============================================================================================
export const getEventsByVenueId = async(venueId: number): Promise<Event[] | null> => {
  return await db.manyOrNone('select * from events where venue_id = $1 and date >= now()', [venueId]);
}
//===============================================================================================
export const getEventIdByBookingId = async(bookingId: number): Promise<{event_id: number} | null> => {
  return await db.oneOrNone('select event_id from bookings where id = $1', [bookingId]);
}
//===============================================================================================
export const getEventDate = async(eventId: number): Promise<Date> => {
  const result = await db.one('select date from events where id = $1', [eventId]);
  return new Date(result.date)
}