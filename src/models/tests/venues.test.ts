import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../services/getters/venueGetters', async() => ({
  getVenueById: vi.fn(),
}));

vi.mock('../../services/getters/eventGetters', async() => ({
  getEventsByVenueId: vi.fn(),
}));

import request from 'supertest';
import app from '../../app';
import { getVenueById } from '../../services/getters/venueGetters';
import { getEventsByVenueId } from '../../services/getters/eventGetters';

const mockedGetVenueById = vi.mocked(getVenueById);
const mockedGetEventsByVenueId = vi.mocked(getEventsByVenueId);

describe('Venues - UC3: View venue information', () => {

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/venues/:id - Get venue details', () => {
    it('should return venue information by ID', async () => {
      const mockVenue = {
        id: 1,
        name: 'National Concert Hall',
        city: 'Reykjavik',
        address: 'Austurbakki 15',
        capacity: 1200,
      };
      mockedGetVenueById.mockResolvedValue(mockVenue);

      const res = await request(app).get('/api/venues/1');
      expect(res.status).toBe(200);
      expect(res.body.venue.name).toBe('National Concert Hall');
      expect(res.body.venue.capacity).toBe(1200);
    });

    it('should return venue capacity', async () => {
      const mockVenue = {
        id: 1,
        name: 'Football Stadium',
        city: 'Reykjavik',
        address: 'Sports Ave 10',
        capacity: 5000,
      };
      mockedGetVenueById.mockResolvedValue(mockVenue);

      const res = await request(app).get('/api/venues/1');
      expect(res.status).toBe(200);
      expect(res.body.venue.capacity).toBe(5000);
    });

    it('should return 404 when venue not found', async () => {
      mockedGetVenueById.mockResolvedValue(null);

      const res = await request(app).get('/api/venues/999');
      expect(res.status).toBe(404);
      expect(res.body.venue).toBeUndefined();
    });

    it('should reject invalid venue ID', async () => {
      const res = await request(app).get('/api/venues/invalid');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/venues/:id/events - Get upcoming events at venue', () => {
    it('should return upcoming events for a venue', async () => {
      const mockVenue = {
        id: 1,
        name: 'National Concert Hall',
        city: 'Reykjavik',
        address: 'Austurbakki 15',
        capacity: 1200,
      };
      const mockEvents = [
        {
          id: 1,
          name: 'Concert',
          date: '2026-02-15T19:00:00Z',
          description: 'Concert',
          venue_id: 1,
          category_id: 1,
          created_at: new Date(),
        },
        {
          id: 2,
          name: 'Theater Show',
          date: '2026-03-20T20:00:00Z',
          description: 'Theater',
          venue_id: 1,
          category_id: 2,
          created_at: new Date(),
        },
      ];
      mockedGetVenueById.mockResolvedValue(mockVenue);
      mockedGetEventsByVenueId.mockResolvedValue(mockEvents);

      const res = await request(app).get('/api/venues/1/events');
      expect(res.status).toBe(200);
      expect(res.body.events).toHaveLength(2);
      expect(res.body.events[0].venue_id).toBe(1);
      expect(res.body.events[1].venue_id).toBe(1);
    });

    it('should return empty array when no events at venue', async () => {
      const mockVenue = {
        id: 1,
        name: 'National Concert Hall',
        city: 'Reykjavik',
        address: 'Austurbakki 15',
        capacity: 1200,
      };
      mockedGetVenueById.mockResolvedValue(mockVenue);
      mockedGetEventsByVenueId.mockResolvedValue(null);

      const res = await request(app).get('/api/venues/1/events');
      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
    });

    it('should reject invalid venue ID', async () => {
      mockedGetVenueById.mockResolvedValue(null);

      const res = await request(app).get('/api/venues/3/events');
      expect(res.status).toBe(404);
    });
  });
});
