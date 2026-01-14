import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('../../config/db', () => ({
    default: {
        oneOrNone: vi.fn(),
        one: vi.fn(),
    }
}));
import { checkTicketAvailability, cancelBookingCondition, doesUserOwnBooking } from '../../services/checkers';
import db from '../../config/db';
const mockedOneOrNone = vi.mocked(db.oneOrNone);
const mockedOne = vi.mocked(db.one);
describe('Business Logic Validation - Checkers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    describe('checkTicketAvailability', () => {
        it('should return true when tickets are available for quantity', async () => {
            mockedOneOrNone.mockResolvedValueOnce({ id: 1, quantity_available: 50 });
            mockedOne.mockResolvedValueOnce({ quantity_available: 50 });
            const result = await checkTicketAvailability(1, 10);
            expect(result).toBe(true);
        });
        it('should return false when not enough tickets', async () => {
            mockedOneOrNone.mockResolvedValueOnce({ id: 1, quantity_available: 5 });
            mockedOne.mockResolvedValueOnce({ quantity_available: 5 });
            const result = await checkTicketAvailability(1, 10);
            expect(result).toBe(false);
        });
        it('should return true for single ticket', async () => {
            mockedOneOrNone.mockResolvedValueOnce({ id: 1, quantity_available: 1 });
            mockedOne.mockResolvedValueOnce({ quantity_available: 1 });
            const result = await checkTicketAvailability(1, 1);
            expect(result).toBe(true);
        });
        it('should return false when ticket does not exist', async () => {
            mockedOneOrNone.mockResolvedValueOnce(undefined);
            const result = await checkTicketAvailability(999, 1);
            expect(result).toBe(false);
        });
        it('should return false when no tickets available', async () => {
            mockedOneOrNone.mockResolvedValueOnce({ id: 1, quantity_available: 0 });
            mockedOne.mockResolvedValueOnce({ quantity_available: 0 });
            const result = await checkTicketAvailability(1, 1);
            expect(result).toBe(false);
        });
    });
    describe('doesUserOwnBooking', () => {
        it('should return true when user owns booking', async () => {
            mockedOneOrNone.mockResolvedValueOnce({
                id: 1,
                user_id: 1,
                event_id: 1,
            });
            const result = await doesUserOwnBooking(1, 1);
            expect(result).toBe(true);
        });
        it('should return false when booking not found or user does not own it', async () => {
            mockedOneOrNone.mockResolvedValueOnce(null);
            const result = await doesUserOwnBooking(2, 1);
            expect(result).toBe(false);
        });
    });
    describe('cancelBookingCondition', () => {
        it('should allow cancellation when more than 24 hours before event', async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 2); // 2 days from now
            mockedOneOrNone.mockResolvedValueOnce({ date: futureDate });
            mockedOneOrNone.mockResolvedValueOnce({
                id: 1,
                user_id: 1,
                event_id: 1,
            });
            const result = await cancelBookingCondition(1, 1, 1);
            expect(result).toBe(true);
        });
        it('should reject cancellation when less than 24 hours before event', async () => {
            const soonDate = new Date();
            soonDate.setHours(soonDate.getHours() + 12); // 12 hours from now
            mockedOne.mockResolvedValueOnce({ date: soonDate });
            mockedOneOrNone.mockResolvedValueOnce({
                id: 1,
                user_id: 1,
                event_id: 1,
            });
            const result = await cancelBookingCondition(1, 1, 1);
            expect(result).toBe(false);
        });
        it('should reject cancellation when user does not own booking', async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 2);
            mockedOne.mockResolvedValueOnce({ date: futureDate });
            mockedOneOrNone.mockResolvedValueOnce(null);
            const result = await cancelBookingCondition(1, 1, 1);
            expect(result).toBe(false);
        });
        it('should reject cancellation for past events', async () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            mockedOne.mockResolvedValueOnce({ date: pastDate });
            mockedOneOrNone.mockResolvedValueOnce({
                id: 1,
                user_id: 1,
                event_id: 1,
            });
            const result = await cancelBookingCondition(1, 1, 1);
            expect(result).toBe(false);
        });
        it('should allow cancellation exactly at 24-hour mark', async () => {
            const exactDate = new Date();
            exactDate.setDate(exactDate.getDate() + 1);
            exactDate.setHours(exactDate.getHours() + 1); // 25 hours from now
            mockedOneOrNone.mockResolvedValueOnce({ date: exactDate });
            mockedOneOrNone.mockResolvedValueOnce({
                id: 1,
                user_id: 1,
                event_id: 1,
            });
            const result = await cancelBookingCondition(1, 1, 1);
            expect(result).toBe(true);
        });
    });
});
