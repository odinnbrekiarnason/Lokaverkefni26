import db from "../../config/db.js";
import { Venue } from "../../config/typesAndInterfaces.js";
import { getEventById } from "./eventGetters.js";

export const getAllVenues = async(): Promise<Venue[]> => {
  return await db.many<Venue>('select * from venues');
}
//===============================================================================================
export const getVenueById = async(id: number): Promise<Venue | null> => {
  return await db.oneOrNone('select * from venues where id = $1', [id]);
}
//===============================================================================================
export const getVenueCap = async(id: number): Promise<number | null> => {
  return await db.oneOrNone('select capacity from venues where id = $1', [id]);
}
//===============================================================================================
export const getVenueByEventId = async(eventId: number): Promise<Venue | null> => {
  const event = await getEventById(eventId);
  const venueId = event!.venue_id;
  const venue = await getVenueById(venueId);
  return venue;
}