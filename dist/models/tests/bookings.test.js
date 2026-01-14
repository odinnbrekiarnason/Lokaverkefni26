import { beforeEach, describe, it, expect, vi } from 'vitest';
vi.mock('../../services/getters');
vi.mock('../../models/bookingModel');
vi.mock('../../services/checkers');
import request from 'supertest';
import app from '../../app';
import { getBookingById, getUserById, getEventById, getTicketForEvent, getEventIdByBookingId, getBookingsMadeByUser } from '../../services/getters';
import { createBooking, cancelBooking } from '../../models/bookingModel';
import { createBookingCondition, cancelBookingCondition } from '../../services/checkers';
import jwt from 'jsonwebtoken';
const mockedGetBookingById = vi.mocked(getBookingById);
const mockedGetUserById = vi.mocked(getUserById);
const mockedGetEventById = vi.mocked(getEventById);
const mockedGetTicketForEvent = vi.mocked(getTicketForEvent);
const mockedGetEventIdByBookingId = vi.mocked(getEventIdByBookingId);
const mockedGetBookingsMadeByUser = vi.mocked(getBookingsMadeByUser);
const mockedCreateBooking = vi.mocked(createBooking);
const mockedCancelBooking = vi.mocked(cancelBooking);
const mockedCreateBookingCondition = vi.mocked(createBookingCondition);
const mockedCancelBookingCondition = vi.mocked(cancelBookingCondition);
const createToken = (userId, role = 'User') => {
    return jwt.sign({
        sub: userId,
        user_name: 'testuser',
        role: role,
    }, process.env.JWT_SECRET);
};
describe('Bookings - UC6, UC7, UC8: Create, view and cancel bookings', () => {
    beforeEach(() => {
        mockedGetTicketForEvent.mockReset();
        mockedCreateBooking.mockReset();
        mockedCancelBooking.mockReset();
        mockedGetEventById.mockReset();
        mockedGetBookingById.mockReset();
        mockedGetUserById.mockReset();
        mockedGetEventIdByBookingId.mockReset();
        mockedGetBookingsMadeByUser.mockReset();
        mockedCreateBookingCondition.mockReset();
        mockedCancelBookingCondition.mockReset();
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
                .post('/api/events/book/1/1/2')
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
                .post('/api/events/book/1/999/1')
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
                .post('/api/events/book/1/1/1')
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
                .post('/api/events/book/1/1/5')
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
                .post('/api/events/book/1/1/1')
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
                .post('/api/events/book/1/1/1')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(412);
        });
        it('should require authentication', async () => {
            const res = await request(app).post('/api/events/book/1/1/1');
            expect(res.status).toBe(401);
        });
    });
    describe('GET /api/user/bookings/:userId - Get user bookings (UC7)', () => {
        it('should return user booking history', async () => {
            const token = createToken(1);
            const mockBookings = [
                {
                    id: 1,
                    user_id: 1,
                    event_id: 1,
                    ticket_id: 101,
                    quantity: 2,
                    created_at: new Date(),
                },
                {
                    id: 2,
                    user_id: 1,
                    event_id: 2,
                    ticket_id: 102,
                    quantity: 1,
                    created_at: new Date(),
                },
            ];
            mockedGetBookingsMadeByUser.mockResolvedValue(mockBookings);
            const res = await request(app)
                .get('/api/user/bookings/1')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.bookings)).toBe(true);
        });
        it('should return empty array when user has no bookings', async () => {
            const token = createToken(1);
            mockedGetBookingsMadeByUser.mockResolvedValue(null);
            const res = await request(app)
                .get('/api/user/bookings/1')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
        });
        it('should require authentication', async () => {
            const res = await request(app).get('/api/user/bookings/1');
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
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockedGetBookingById.mockResolvedValue(mockBooking);
            mockedGetUserById.mockResolvedValue(mockUser);
            mockedGetEventIdByBookingId.mockResolvedValue(1);
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
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockedGetBookingById.mockResolvedValue(mockBooking);
            mockedGetUserById.mockResolvedValue(mockUser);
            mockedGetEventIdByBookingId.mockResolvedValue(1);
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
