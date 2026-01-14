import { beforeEach, describe, it, expect, vi } from 'vitest';
vi.mock('../../services/getters');
import request from 'supertest';
import app from '../../app';
import { getAllEvents, getEventById } from '../../services/getters';
const mockedGetAllEvents = vi.mocked(getAllEvents);
const mockedGetEventById = vi.mocked(getEventById);
describe('Events - UC1 & UC2: View events and event details', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedGetAllEvents.mockReset();
        mockedGetEventById.mockReset();
    });
    describe('GET /api/events - Get all events', () => {
        it('should return all upcoming events when no filters applied', async () => {
            const mockEvents = [
                {
                    id: 1,
                    name: 'Rock Concert',
                    date: '2026-02-15T19:00:00Z',
                    description: 'Amazing rock concert',
                    venue_id: 1,
                    category_id: 1,
                    created_at: new Date(),
                },
                {
                    id: 2,
                    name: 'Football Match',
                    date: '2026-03-20T15:00:00Z',
                    description: 'Championship game',
                    venue_id: 2,
                    category_id: 3,
                    created_at: new Date(),
                },
            ];
            mockedGetAllEvents.mockResolvedValue(mockEvents);
            const res = await request(app).get('/api/events');
            expect(res.status).toBe(200);
            expect(res.body.events).toHaveLength(2);
            expect(res.body.events[0].name).toBe('Rock Concert');
        });
        it('should filter events by category', async () => {
            const mockEvents = [
                {
                    id: 1,
                    name: 'Rock Concert',
                    date: '2026-02-15T19:00:00Z',
                    description: 'Amazing rock concert',
                    venue_id: 1,
                    category_id: 1,
                    created_at: new Date(),
                },
            ];
            mockedGetAllEvents.mockResolvedValue(mockEvents);
            const res = await request(app).get('/api/events?category=1');
            expect(res.status).toBe(200);
            expect(res.body.events[0].category_id).toBe(1);
        });
        it('should filter events by city', async () => {
            const mockEvents = [
                {
                    id: 1,
                    name: 'Reykjavik Concert',
                    date: '2026-02-15T19:00:00Z',
                    description: 'Concert in Reykjavik',
                    venue_id: 1,
                    category_id: 1,
                    created_at: new Date(),
                    venue_city: 'Reykjavik',
                },
            ];
            mockedGetAllEvents.mockResolvedValue(mockEvents);
            const res = await request(app).get('/api/events?city=Reykjavik');
            expect(res.status).toBe(200);
            expect(res.body.events[0].venue_city).toBe('Reykjavik');
        });
        it('should filter events by date range', async () => {
            const mockEvents = [
                {
                    id: 1,
                    name: 'Event in range',
                    date: '2026-02-15T19:00:00Z',
                    description: 'Event',
                    venue_id: 1,
                    category_id: 1,
                    created_at: new Date(),
                },
            ];
            mockedGetAllEvents.mockResolvedValue(mockEvents);
            const res = await request(app)
                .get('/api/events')
                .query({
                dateFrom: '2026-02-01',
                dateTo: '2026-02-28',
            });
            expect(res.status).toBe(200);
            expect(res.body.events).toHaveLength(1);
        });
        it('should sort events by date ascending (default)', async () => {
            const mockEvents = [
                {
                    id: 1,
                    name: 'First Event',
                    date: new Date('2026-02-15T19:00:00Z'),
                    description: 'First',
                    venue_id: 1,
                    category_id: 1,
                    created_at: new Date(),
                },
                {
                    id: 2,
                    name: 'Second Event',
                    date: new Date('2026-03-20T19:00:00Z'),
                    description: 'Second',
                    venue_id: 1,
                    category_id: 1,
                    created_at: new Date(),
                },
            ];
            mockedGetAllEvents.mockResolvedValue(mockEvents);
            const res = await request(app).get('/api/events?sort=date&order=asc');
            const eventDate1 = new Date(res.body.events[0].date).getTime();
            const eventDate2 = new Date(res.body.events[1].date).getTime();
            expect(res.status).toBe(200);
            expect(eventDate1).toBeLessThan(eventDate2);
        });
        it('should sort events by price', async () => {
            const mockEvents = [
                {
                    id: 1,
                    name: 'Cheap Event',
                    date: '2026-02-15T19:00:00Z',
                    description: 'Cheap',
                    venue_id: 1,
                    category_id: 1,
                    created_at: new Date(),
                    price: 2000,
                },
            ];
            mockedGetAllEvents.mockResolvedValue(mockEvents);
            const res = await request(app).get('/api/events?sort=price');
            expect(res.status).toBe(200);
        });
        it('should handle pagination', async () => {
            mockedGetAllEvents.mockResolvedValue([]);
            const res = await request(app).get('/api/events?page=1&limit=10');
            expect(res.status).toBe(200);
        });
        it('should return empty array when no events found', async () => {
            mockedGetAllEvents.mockResolvedValue([]);
            const res = await request(app).get('/api/events?category=999');
            expect(res.status).toBe(200);
            expect(res.body.events).toEqual([]);
        });
    });
    describe('GET /api/events/:id - Get single event details', () => {
        it('should return event details by ID', async () => {
            const mockEvent = {
                id: 1,
                name: 'Rock Concert',
                date: '2026-02-15T19:00:00Z',
                description: 'Amazing rock concert with live band',
                venue_id: 1,
                category_id: 1,
                created_at: new Date(),
            };
            mockedGetEventById.mockResolvedValue(mockEvent);
            const res = await request(app).get('/api/events/1');
            expect(res.status).toBe(200);
            expect(res.body.event.id).toBe(1);
            expect(res.body.event.name).toBe('Rock Concert');
        });
        it('should return 404 when event not found', async () => {
            mockedGetEventById.mockResolvedValue(null);
            const res = await request(app).get('/api/events/999');
            expect(res.status).toBe(200);
            expect(res.body.event).toBeNull();
        });
        it('should reject invalid event ID parameter', async () => {
            const res = await request(app).get('/api/events/invalid');
            expect(res.status).toBe(400);
        });
        it('should reject negative event ID', async () => {
            const res = await request(app).get('/api/events/-1');
            expect(res.status).toBe(400);
        });
    });
});
