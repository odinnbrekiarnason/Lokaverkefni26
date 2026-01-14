import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../services/getters/userGetters', async() => ({
  getUserById: vi.fn(),
  getMyEvents: vi.fn(),
}));

import request from 'supertest';
import app from '../../app';
import { getMyEvents, getUserById } from '../../services/getters/userGetters';
import jwt from 'jsonwebtoken';

const mockedGetUserById = vi.mocked(getUserById);

const createToken = (userId: number, role: 'User' | 'Admin' = 'User') => {
  return jwt.sign({
    sub: userId,
    user_name: 'testuser',
    role: role,
  }, process.env.JWT_SECRET!);
};

describe('Payment - Add funds to wallet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PUT /api/me/payme - Add funds', () => {
    it('should add funds to user wallet', async () => {
      const token = createToken(1);
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

      mockedGetUserById.mockResolvedValue(mockUser);

      const res = await request(app)
        .put('/api/me/payme')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 5000 });

        expect(res.body.user_name).toBe('Alice');
        expect(res.status).toBe(200);
    });

    it('should add positive amount', async () => {
      const token = createToken(1);
      const mockUser = {
        id: 1,
        user_name: 'Bob',
        email: 'bob@example.com',
        password_hash: 'hashed',
        user_role: 'User' as const,
        wallet: 5000,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedGetUserById.mockResolvedValue(mockUser);

      const res = await request(app)
        .put('/api/me/payme')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 1000 });
        console.log(res.body);
        expect(res.body.wallet).toBeGreaterThan(5000);
        expect(res.status).toBe(200);
    });

    it('should return 400 when amount is negative', async () => {
      const token = createToken(1);

      const res = await request(app)
        .put('/api/me/payme')
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: -1000 });

      expect(res.status).toBe(400);
    });

    it('should return 400 when amount is missing', async () => {
      const token = createToken(1);

      const res = await request(app)
        .put('/api/me/payme')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app)
        .put('/api/me/payme')
        .send({ amount: 1000 });

      expect(res.status).toBe(401);
    });
  });
});
