import { getAllEvents, getAllVenues, getEventById, getEventsByVenueId, getVenueById } from '../services/getters.js';
export const getAllEventsCtrl = async (req, res, next) => {
    try {
        const filters = req.queryParsed;
        if (Object.keys(filters).length === 0) {
            const events = await getAllEvents();
            if (!events)
                return res.status(200).json({ success: true, events: [], message: 'No events going on right now :(' });
            return res.status(200).json({ events: events });
        }
        const result = await getAllEvents(filters);
        if (!result) {
            return res.status(400).json({ error: 'Filter input incorrect' });
        }
        return res.status(200).json({ events: result });
    }
    catch (e) {
        next(e);
    }
};
export const getOneEventCtrl = async (req, res, next) => {
    try {
        const { id } = req.paramsParsed;
        if (!id) {
            return res.status(404).json({ error: 'No event found on this ID' });
        }
        const result = await getEventById(id);
        return res.status(200).json({ event: result });
    }
    catch (e) {
        next(e);
    }
};
export const getAllVenuesCtrl = async (req, res, next) => {
    try {
        const venues = await getAllVenues();
        return res.status(200).json({ venues: venues });
    }
    catch (e) {
        next(e);
    }
};
export const getOneVenueCtrl = async (req, res, next) => {
    try {
        const { id } = req.paramsParsed;
        if (!id) {
            res.status(400).json({ error: 'ID is required' });
        }
        const venue = await getVenueById(id);
        if (!venue) {
            return res.status(404).json({ error: "No venue found on this ID" });
        }
        return res.status(200).json({ venue: venue });
    }
    catch (e) {
        next(e);
    }
};
export const getEventsByVenueCtrl = async (req, res, next) => {
    try {
        const { id } = req.paramsParsed;
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }
        const venue = await getVenueById(id);
        if (!venue) {
            return res.status(404).json({ error: 'No venue found on this id' });
        }
        const events = await getEventsByVenueId(id);
        if (!events) {
            return res.status(404).json({ error: 'No events happening here' });
        }
        return res.status(200).json({ venue: venue, events: events });
    }
    catch (e) {
        next(e);
    }
};
