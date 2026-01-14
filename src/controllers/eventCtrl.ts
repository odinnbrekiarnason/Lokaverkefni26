import { Request, Response, NextFunction} from 'express'
import { getAllEvents, getEventById, getEventsByVenueId } from '../services/getters/eventGetters.js';
import { getAllVenues, getVenueById } from '../services/getters/venueGetters.js';
import { EventFilters, IdParam } from '../config/schemas.js';

export const getAllEventsCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const filters: EventFilters = req.queryParsed;

    if (Object.keys(filters).length === 0) {
      const events = await getAllEvents();
      if(!events) return res.status(204).json({sucess: true, events: [], message: 'No events going on right now :('});
      return res.status(200).json({ events: events });
    }

    const result = await getAllEvents(filters);
    if(!result) {
      return res.status(400).json({error: 'Filter input incorrect'});
    }
    
    return res.status(200).json({events: result});
  } catch(e) {
    next(e);
  }
}

export const getOneEventCtrl = async(req: Request, res: Response, next: NextFunction) => {
  try{
    const {id}: IdParam = req.paramsParsed;

    if(!id) {
      return res.status(404).json({error: 'No event found on this ID'});
    }

    const result = await getEventById(id);
    return res.status(200).json({event: result});
  } catch(e) {
    next(e)
  }
}

export const getAllVenuesCtrl = async(req: Request, res: Response, next: NextFunction) => {
  try{
    const venues = await getAllVenues();
    return res.status(200).json({venues: venues});
  } catch(e) {
    next(e);
  }
}

export const getOneVenueCtrl = async(req: Request, res: Response, next: NextFunction) => {
  try{
    const {id}: IdParam = req.paramsParsed; 
    if(!id) {
      res.status(400).json({error: 'ID is required'});
    }

    const venue = await getVenueById(id);
    if(!venue) {
      return res.status(404).json({error: "No venue found on this ID"});
    }
    return res.status(200).json({venue: venue})
  } catch(e) {
    next(e);
  }
}

export const getEventsByVenueCtrl = async(req: Request, res: Response, next: NextFunction) => {
  try{
    const {id}: IdParam = req.paramsParsed;
    if(!id) {
      return res.status(400).json({error: 'ID is required'});
    }

    const venue = await getVenueById(id);
    if(!venue) {
      return res.status(404).json({error: 'No venue found on this id'});
    }

    const events = await getEventsByVenueId(id);
    if(!events) {
      return res.status(404).json({error: 'No events happening here'});
    }
    
    return res.status(200).json({venue: venue, events: events});
  } catch(e) {
    next(e);
  }
}