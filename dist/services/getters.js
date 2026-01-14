import db from '../config/db.js';
//===============================================================================================
//                            NOTE GETTERS RETURN THEIR RESPECTIVE TYPES
//===============================================================================================
//
//                                         EVENT GETTERS 
//
//===============================================================================================
export const getAllEvents = async (filters) => {
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
    let sql = `select e.*, v.address as venue_address, v.city as venue_city from events e join venues v on e.venue_id = v.id where e.date >= now() ${whereSql} order by e.${sort} ${order}`;
    if (filters.page && filters.limit) {
        const pagination = (filters.page - 1) * filters.limit;
        sql += ` OFFSET $${idx++} LIMIT $${idx++}`;
        values.push(pagination, filters.limit);
    }
    const result = await db.manyOrNone(sql, values);
    return result;
};
//===============================================================================================
export const getEventById = async (eventId) => {
    return await db.oneOrNone('select * from events where id = $1', [eventId]);
};
//===============================================================================================
export const getEventsByVenueId = async (venueId) => {
    return await db.manyOrNone('select * from events where venue_id = $1 and date >= now()', [venueId]);
};
//===============================================================================================
export const getEventIdByBookingId = async (bookingId) => {
    return await db.oneOrNone('select event_id from bookings where id = $1', [bookingId]);
};
//===============================================================================================
export const getEventDate = async (eventId) => {
    const result = await db.one('select date from events where id = $1', [eventId]);
    return new Date(result.date);
};
//===============================================================================================
//
//                                         VENUE GETTERS 
//
//===============================================================================================
export const getAllVenues = async () => {
    return await db.one('select * from venues');
};
//===============================================================================================
export const getVenueById = async (id) => {
    return await db.oneOrNone('select * from venues where id = $1', [id]);
};
//===============================================================================================
export const getVenueCap = async (id) => {
    return await db.oneOrNone('select capacity from venues where id = $1', [id]);
};
//===============================================================================================
export const getVenueByEventId = async (eventId) => {
    const event = await getEventById(eventId);
    const venueId = event.venue_id;
    const venue = await getVenueById(venueId);
    return venue;
};
//===============================================================================================
//
//                                         BOOKING GETTERS
//
//===============================================================================================
export const getBookingById = async (id) => {
    return await db.oneOrNone('select * from bookings where id = $1', [id]);
};
//===============================================================================================
export const getBookingsMadeByUser = async (userId) => {
    return await db.manyOrNone('select * from bookings where user_id = $1', [userId]);
};
//===============================================================================================
//
//                                         TICKET GETTERS 
//
//===============================================================================================
export const getTicketsById = async (id) => {
    return await db.oneOrNone('select * from tickets where id = $1', [id]);
};
//===============================================================================================
export const getTicketForEvent = async (eventId) => {
    return await db.oneOrNone('select * from tickets where event_id = $1', [eventId]);
};
//===============================================================================================
//
//                                         USER GETTERS 
//
//===============================================================================================
export const getUserById = async (id) => {
    return await db.oneOrNone('select * from users where id = $1', [id]);
};
//===============================================================================================
export const getUserByIdWoPw = async (id) => {
    return await db.oneOrNone('select id, user_name, email, user_role, wallet, created_at, updated_at from users where id = $1', [id]);
};
//===============================================================================================
export const getUserByEmail = async (email) => {
    return await db.oneOrNone(`select * from users where email like '%$1%'`, [email]);
};
//===============================================================================================
//export const checkDupeEmail = async(email: string): Promise<User>
//===============================================================================================
export const getUserDetails = async (email, id) => {
    return await db.oneOrNone('select * from users where email = $1 and id = $2', [email, id]);
};
//===============================================================================================
//
//                                         CATEGORY GETTERS 
//
//===============================================================================================
export const getAllCategories = async () => {
    return await db.many('select * from categories');
};
//===============================================================================================
export const getCategoryById = async (id) => {
    return await db.oneOrNone('select * from categories where id = $1', [id]);
};
//===============================================================================================
//
//                                         MISC GETTERS 
//
//===============================================================================================
