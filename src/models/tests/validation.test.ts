import { describe, it, expect } from 'vitest';
import {CreateUserSchema, LoginSchema, IdSchema, CreateBookingSchema, editUserSchema, eventFiltersSchema, PaymentSchemaBody } from '../../config/schemas';

describe('Input Validation - Zod Schemas', () => {
  describe('User Schemas', () => {
    describe('CreateUserSchema', () => {
      it('should validate correct user data', () => {
        const userData = {
          user_name: 'Alice',
          email: 'alice@example.com',
          password_hash: 'securepassword123',
          wallet: 10000,
        };
        expect(() => CreateUserSchema.parse(userData)).not.toThrow();
      });

      it('should reject username shorter than 3 chars', () => {
        const userData = {
          user_name: 'ab',
          email: 'alice@example.com',
          password_hash: 'securepassword123',
        };
        expect(() => CreateUserSchema.parse(userData)).toThrow();
      });

      it('should reject username longer than 30 chars', () => {
        const userData = {
          user_name: 'a'.repeat(31),
          email: 'alice@example.com',
          password_hash: 'securepassword123',
        };
        expect(() => CreateUserSchema.parse(userData)).toThrow();
      });

      it('should reject invalid email', () => {
        const userData = {
          user_name: 'Alice',
          email: 'not-an-email',
          password_hash: 'securepassword123',
        };
        expect(() => CreateUserSchema.parse(userData)).toThrow();
      });

      it('should reject password shorter than 8 chars', () => {
        const userData = {
          user_name: 'Alice',
          email: 'alice@example.com',
          password_hash: 'short',
        };
        expect(() => CreateUserSchema.parse(userData)).toThrow();
      });

      it('should reject negative wallet', () => {
        const userData = {
          user_name: 'Alice',
          email: 'alice@example.com',
          password_hash: 'securepassword123',
          wallet: -1000,
        };
        expect(() => CreateUserSchema.parse(userData)).toThrow();
      });

      it('should default wallet to value if not provided', () => {
        const userData = {
          user_name: 'Alice',
          email: 'alice@example.com',
          password_hash: 'securepassword123',
        };
        const result = CreateUserSchema.parse(userData);
        expect(result.wallet).toBeDefined();
      });

      it('should default role to User', () => {
        const userData = {
          user_name: 'Alice',
          email: 'alice@example.com',
          password_hash: 'securepassword123',
        };
        const result = CreateUserSchema.parse(userData);
        expect(result.userRole).toBe('User');
      });

      it('should convert email to lowercase', () => {
        const userData = {
          user_name: 'Alice',
          email: 'ALICE@EXAMPLE.COM',
          password_hash: 'securepassword123',
        };
        const result = CreateUserSchema.parse(userData);
        expect(result.email).toBe('alice@example.com');
      });
    });

    describe('LoginSchema', () => {
      it('should validate correct login data', () => {
        const loginData = {
          email: 'alice@example.com',
          password_hash: 'securepassword123',
        };
        expect(() => LoginSchema.parse(loginData)).not.toThrow();
      });

      it('should reject invalid email', () => {
        const loginData = {
          email: 'not-an-email',
          password_hash: 'securepassword123',
        };
        expect(() => LoginSchema.parse(loginData)).toThrow();
      });

      it('should reject empty password', () => {
        const loginData = {
          email: 'alice@example.com',
          password_hash: '',
        };
        expect(() => LoginSchema.parse(loginData)).toThrow();
      });
    });

    describe('editUserSchema', () => {
      it('should allow partial updates', () => {
        const editData = {
          user_name: 'NewAlice',
        };
        expect(() => editUserSchema.parse(editData)).not.toThrow();
      });

      it('should validate email when provided', () => {
        const editData = {
          email: 'not-an-email',
        };
        expect(() => editUserSchema.parse(editData)).toThrow();
      });

      it('should allow all fields to be undefined', () => {
        const editData = {};
        expect(() => editUserSchema.parse(editData)).not.toThrow();
      });

      it('should reject password shorter than 8 chars', () => {
        const editData = {
          password_hash: 'short',
        };
        expect(() => editUserSchema.parse(editData)).toThrow();
      });
    });
  });

  describe('Booking Schemas', () => {
    describe('CreateBookingSchema', () => {
      it('should validate correct booking data', () => {
        const bookingData = {
          event_id: 1,
          quantity: 2,
        };
        expect(() => CreateBookingSchema.parse(bookingData)).not.toThrow();
      });

      it('should reject negative event_id', () => {
        const bookingData = {
          event_id: -1,
          quantity: 1,
        };
        expect(() => CreateBookingSchema.parse(bookingData)).toThrow();
      });

      it('should default quantity to 1', () => {
        const bookingData = {
          user_id: 1,
          event_id: 1,
        };
        const result = CreateBookingSchema.parse(bookingData);
        expect(result.quantity).toBe(1);
      });

      it('should reject missing event_id', () => {
        const bookingData = {
          quantity: 1,
        };
        expect(() => CreateBookingSchema.parse(bookingData)).toThrow();
      });
    });
  });

  describe('Event Schemas', () => {
    describe('eventFiltersSchema', () => {
      it('should validate empty filters', () => {
        const filters = {};
        expect(() => eventFiltersSchema.parse(filters)).not.toThrow();
      });

      it('should reject negative category', () => {
        const filters = {
          category: -1,
        };
        expect(() => eventFiltersSchema.parse(filters)).toThrow();
      });

      it('should validate valid date strings', () => {
        const filters = {
          dateFrom: '2026-01-01',
          dateTo: '2026-12-31',
        };
        expect(() => eventFiltersSchema.parse(filters)).not.toThrow();
      });

      it('should validate valid sort values', () => {
        const filters = {
          sort: 'price',
        };
        expect(() => eventFiltersSchema.parse(filters)).not.toThrow();
      });

      it('should reject invalid sort values', () => {
        const filters = {
          sort: 'invalid',
        };
        expect(() => eventFiltersSchema.parse(filters)).toThrow();
      });

      it('should default sort to date', () => {
        const filters = {};
        const result = eventFiltersSchema.parse(filters);
        expect(result.sort).toBe('date');
      });

      it('should default order to asc', () => {
        const filters = {};
        const result = eventFiltersSchema.parse(filters);
        expect(result.order).toBe('asc');
      });

      it('should default limit to 50', () => {
        const filters = {};
        const result = eventFiltersSchema.parse(filters);
        expect(result.limit).toBe(50);
      });

      it('should reject limit > 100', () => {
        const filters = {
          limit: 101,
        };
        expect(() => eventFiltersSchema.parse(filters)).toThrow();
      });

      it('should reject page <= 0', () => {
        const filters = {
          page: 0,
        };
        expect(() => eventFiltersSchema.parse(filters)).toThrow();
      });
    });
  });

  describe('Payment Schemas', () => {
    describe('PaymentSchemaBody', () => {
      it('should validate positive amount', () => {
        const paymentData = {
          amount: 5000,
        };
        expect(() => PaymentSchemaBody.parse(paymentData)).not.toThrow();
      });

      it('should reject negative amount', () => {
        const paymentData = {
          amount: -1000,
        };
        expect(() => PaymentSchemaBody.parse(paymentData)).toThrow();
      });

      it('should reject empty object', () => {
        const paymentData = {};
        expect(() => PaymentSchemaBody.parse(paymentData)).toThrow();
      });
    });
  });

  describe('ID Schemas', () => {
    describe('IdSchema', () => {
      it('should validate positive ID', () => {
        const idData = {
          id: 1,
        };
        expect(() => IdSchema.parse(idData)).not.toThrow();
      });

      it('should reject negative ID', () => {
        const idData = {
          id: -1,
        };
        expect(() => IdSchema.parse(idData)).toThrow();
      });

      it('should reject zero ID', () => {
        const idData = {
          id: 0,
        };
        expect(() => IdSchema.parse(idData)).toThrow();
      });

      it('should reject non-integer ID', () => {
        const idData = {
          id: 1.5,
        };
        expect(() => IdSchema.parse(idData)).toThrow();
      });

      it('should reject missing ID', () => {
        const idData = {};
        expect(() => IdSchema.parse(idData)).toThrow();
      });
    });
  });
});
