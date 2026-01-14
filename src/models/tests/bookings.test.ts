import { beforeEach, describe, it, expect, vi } from 'vitest';

vi.mock('../../services/getters/bookingGetters', async() => ({
  getBookingById: vi.fn(),
  getBookingsMadeByUser: vi.fn(),
  getTicketForEvent: vi.fn(),
}));

vi.mock('../../services/getters/eventGetters', async() => ({
  getEventById: vi.fn(),
  getEventIdByBookingId: vi.fn(),
}));

vi.mock('../../services/getters/userGetters', async() => ({
  getUserById: vi.fn(),
  getUserByIdWoPw: vi.fn(),
  getMyEvents: vi.fn(),
}));

vi.mock('../../models/bookingModel', async() => ({
  createBooking: vi.fn(),
  cancelBooking: vi.fn(),
}));

vi.mock('../../services/checkers', async() => ({
  createBookingCondition: vi.fn(),
  cancelBookingCondition: vi.fn(),
}));


import request from 'supertest';
import app from '../../app';
import { getBookingById, getTicketForEvent } from '../../services/getters/bookingGetters';
import { getMyEvents, getUserById, getUserByIdWoPw } from '../../services/getters/userGetters';
import { getEventById, getEventIdByBookingId } from '../../services/getters/eventGetters';
import { createBooking, cancelBooking } from '../../models/bookingModel';
import { createBookingCondition, cancelBookingCondition } from '../../services/checkers';
import jwt from 'jsonwebtoken';

const mockedGetMyEvents = vi.mocked(getMyEvents);
const mockedGetBookingById = vi.mocked(getBookingById);
const mockedGetUserById = vi.mocked(getUserById);
const mockedGetUserByIdWoPw = vi.mocked(getUserByIdWoPw);
const mockedGetEventById = vi.mocked(getEventById);
const mockedGetTicketForEvent = vi.mocked(getTicketForEvent);
const mockedGetEventIdByBookingId = vi.mocked(getEventIdByBookingId);
const mockedCreateBooking = vi.mocked(createBooking);
const mockedCancelBooking = vi.mocked(cancelBooking);
const mockedCreateBookingCondition = vi.mocked(createBookingCondition);
const mockedCancelBookingCondition = vi.mocked(cancelBookingCondition);


const createToken = (userId: number, role: 'User' | 'Admin' = 'User') => {
  return jwt.sign({
    sub: userId,
    user_name: 'testuser',
    role: role,
  }, process.env.JWT_SECRET!);
};

describe('Bookings - UC6, UC7, UC8: Create, view and cancel bookings', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Create booking', () => {
    it('should create a booking when conditions are met (happy path)', async () => {
      const token = createToken(1);
      const mockEvent = {
        id: 1,
        name: 'Concert',
        date: '2026-02-15T19:00:00Z',
        description: 'Concert',
        venue_id: 1,
        category_id: 1,
        created_at: new Date(),
      };
      const mockTicket = {
        id: 101,
        event_id: 1,
        price: 5000,
        quantity_available: 100,
      };
      const mockBooking = {
        id: 1,
        user_id: 1,
        event_id: 1,
        ticket_id: 101,
        quantity: 2,
        created_at: new Date(),
      };

      mockedGetEventById.mockResolvedValue(mockEvent);
      mockedGetTicketForEvent.mockResolvedValue(mockTicket);
      mockedCreateBookingCondition.mockResolvedValue(true);
      mockedCreateBooking.mockResolvedValue(mockBooking);

      const res = await request(app)
        .post('/api/events/book/1/2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(parseInt(res.body.result.user_id)).toBe(1);
      expect(res.body.result.quantity).toBe(2);
      expect(mockedCreateBooking).toHaveBeenCalled();
    });

    it('should return 404 when event not found', async () => {
      const token = createToken(1);
      mockedGetEventById.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/events/book/999/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Event not found');
    });

    it('should return 404 when ticket not found', async () => {
      const token = createToken(1);
      const mockEvent = {
        id: 1,
        name: 'Concert',
        date: '2026-02-15T19:00:00Z',
        description: 'Concert',
        venue_id: 1,
        category_id: 1,
        created_at: new Date(),
      };

      mockedGetEventById.mockResolvedValue(mockEvent);
      mockedGetTicketForEvent.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/events/book/1/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Ticket not found');
    });

    it('should return 412 when not enough tickets available', async () => {
      const token = createToken(1);
      const mockEvent = {
        id: 1,
        name: 'Concert',
        date: '2026-02-15T19:00:00Z',
        description: 'Concert',
        venue_id: 1,
        category_id: 1,
        created_at: new Date(),
      };
      const mockTicket = {
        id: 101,
        event_id: 1,
        price: 5000,
        quantity_available: 1,
      };

      mockedGetEventById.mockResolvedValue(mockEvent);
      mockedGetTicketForEvent.mockResolvedValue(mockTicket);
      mockedCreateBookingCondition.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/events/book/1/5')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(412);
      expect(res.body.error).toContain('Booking conditions not met');
    });

    it('should return 412 when user insufficient funds', async () => {
      const token = createToken(1);
      const mockEvent = {
        id: 1,
        name: 'Expensive Concert',
        date: '2026-02-15T19:00:00Z',
        description: 'Concert',
        venue_id: 1,
        category_id: 1,
        created_at: new Date(),
      };
      const mockTicket = {
        id: 101,
        event_id: 1,
        price: 100000,
        quantity_available: 100,
      };

      mockedGetEventById.mockResolvedValue(mockEvent);
      mockedGetTicketForEvent.mockResolvedValue(mockTicket);
      mockedCreateBookingCondition.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/events/book/1/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(412);
    });

    it('should return 412 when event date has passed', async () => {
      const token = createToken(1);
      const mockEvent = {
        id: 1,
        name: 'Past Concert',
        date: '2025-01-15T19:00:00Z',
        description: 'Concert',
        venue_id: 1,
        category_id: 1,
        created_at: new Date(),
      };
      const mockTicket = {
        id: 101,
        event_id: 1,
        price: 5000,
        quantity_available: 100,
      };

      mockedGetEventById.mockResolvedValue(mockEvent);
      mockedGetTicketForEvent.mockResolvedValue(mockTicket);
      mockedCreateBookingCondition.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/events/book/1/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(412);
    });

    it('should require authentication', async () => {
      const res = await request(app).post('/api/events/book/1/1');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/me - Get user bookings (UC7)', () => {
    it('should return user booking history', async () => {
      const token = createToken(1);
      
      const mockUser = {
        id: 1,
        user_name: 'Alice',
        email: 'alice@example.com',
        user_role: 'User' as const,
        wallet: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMyEvents = [
        {
          ticket_count: 2,
          booking_id: 1,
          date: new Date('2026-03-20T15:00:00Z'),
          category: 'Sports',
          city: 'Akureyri',
          address: 'Sports Ave 10',
          event_name: 'Football Match',
        },
        {
          ticket_count: 1,
          booking_id: 2,
          date: new Date('2026-02-15T19:00:00Z'),
          category: 'Music',
          city: 'Reykjavik',
          address: 'Austurbakki 15',
          event_name: 'Rock Concert',
        },
      ];

      mockedGetUserByIdWoPw.mockResolvedValue(mockUser);
      mockedGetMyEvents.mockResolvedValue(mockMyEvents);

      const res = await request(app)
        .get('/api/me/events')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].ticket_count).toBe(2);
      expect(res.body.data[1].city).toBe('Reykjavik');
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/me');
      expect(res.status).toBe(401);
    });
  });

  describe('DELETE /api/events/cancelBooking/:bookingId/:userId - Cancel booking (UC8)', () => {
    it('should cancel booking when conditions are met (happy path)', async () => {
      const token = createToken(1);
      const mockBooking = {
        id: 1,
        user_id: 1,
        event_id: 1,
        ticket_id: 101,
        quantity: 2,
        created_at: new Date(),
      };
      const mockUser = {
        id: 1,
        user_name: 'Alice',
        email: 'alice@example.com',
        password_hash: 'hashed',
        user_role: 'User' as const,
        wallet: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedGetBookingById.mockResolvedValue(mockBooking);
      mockedGetUserById.mockResolvedValue(mockUser);
      mockedGetEventIdByBookingId.mockResolvedValue({event_id: 1});
      mockedCancelBookingCondition.mockResolvedValue(true);
      mockedCancelBooking.mockResolvedValue();

      const res = await request(app)
        .delete('/api/events/cancelBooking/1/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockedCancelBooking).toHaveBeenCalled();
    });

    it('should return 403 when user tries to cancel another user booking', async () => {
      const token = createToken(2);

      const res = await request(app)
        .delete('/api/events/cancelBooking/1/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Cannot cancel booking for another user');
    });

    it('should return 404 when booking not found', async () => {
      const token = createToken(1);
      mockedGetBookingById.mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/events/cancelBooking/1/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it('should return 412 when less than 24 hours before event', async () => {
      const token = createToken(1);
      const mockBooking = {
        id: 1,
        user_id: 1,
        event_id: 1,
        ticket_id: 101,
        quantity: 2,
        created_at: new Date(),
      };
      const mockUser = {
        id: 1,
        user_name: 'Alice',
        email: 'alice@example.com',
        password_hash: 'hashed',
        user_role: 'User' as const,
        wallet: 10000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedGetBookingById.mockResolvedValue(mockBooking);
      mockedGetUserById.mockResolvedValue(mockUser);
      mockedGetEventIdByBookingId.mockResolvedValue({event_id: 1});
      mockedCancelBookingCondition.mockResolvedValue(false);

      const res = await request(app)
        .delete('/api/events/cancelBooking/1/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(412);
      expect(res.body.error).toContain('Cancel booking conditions not met');
    });

    it('should require authentication', async () => {
      const res = await request(app).delete('/api/events/cancelBooking/1/1');
      expect(res.status).toBe(401);
    });
  });
});
