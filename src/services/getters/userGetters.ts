import db from "../../config/db.js";
import { User, UserWoPw } from "../../config/typesAndInterfaces.js";


//===============================================================================================

export const getUserById = async(id: number): Promise<User | null> => {
  return await db.oneOrNone('select * from users where id = $1', [id]);
}

//===============================================================================================

export const getUserByIdWoPw = async(id: number): Promise<UserWoPw | null> => {
  return await db.oneOrNone('select id, user_name, email, user_role, wallet, created_at, updated_at from users where id = $1', [id]);
}

//===============================================================================================

export const getUserByEmail = async(email: string): Promise<User | null> => {
  return await db.oneOrNone(`select * from users where email like $1`, [`%${email}%`]);
}

//===============================================================================================

export const getMyEvents = async(user_id: number): Promise<any | null> => {
  return await db.manyOrNone(`
    select 
    b.quantity as ticket_count, b.id as booking_id, e.date as date, c.name as category, 
    v.city as City, v.address as address, e.name as event_name 
    from users u
      join bookings b on u.id = b.user_id
      join events e on b.event_id = e.id
      join venues v on e.venue_id = v.id
      join categories c on e.category_id = c.id 
      group by date, address, city, event_name, ticket_count, category, booking_id
      order by date desc
    where id = $1
    `, [user_id]);
}