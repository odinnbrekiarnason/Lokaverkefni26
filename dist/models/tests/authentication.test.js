process.env.JWT_SECRET = 'test_secret';
process.env.ROUNDS = '1';
import { beforeEach, describe, it, expect, vi } from 'vitest';
vi.mock('../../services/getters', () => ({
    getUserByEmail: vi.fn(),
    getBookingsMadeByUser: vi.fn(),
    getAllEvents: vi.fn(),
}));
vi.mock('../../models/userModel', () => ({
    createUser: vi.fn(),
}));
vi.mock('bcrypt', () => {
    const hash = vi.fn(async (_pw, _rounds) => 'hashed-newpassword');
    const compare = vi.fn(async () => true);
    return {
        default: { hash, compare },
        hash,
        compare,
    };
});
import request from 'supertest';
import app from '../../app';
import { getAllEvents, getUserByEmail } from '../../services/getters';
import { createUser } from '../../models/userModel';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
const mockedGetAllEvents = vi.mocked(getAllEvents);
const mockedGetUserByEmail = vi.mocked(getUserByEmail);
const mockedCreateUser = vi.mocked(createUser);
const mockedBcryptCompare = vi.mocked(compare);
const mockedBcryptHash = vi.mocked(hash);
const createToken = (userId, role = 'User') => {
    return jwt.sign({
        sub: userId,
        user_name: 'testuser',
        role: role,
    }, process.env.JWT_SECRET);
};
describe('Authentication & Authorization - UC4, UC5', () => {
    beforeEach(() => {
        mockedCreateUser.mockReset();
        mockedBcryptCompare.mockReset();
        mockedBcryptHash.mockReset();
        mockedBcryptHash.mockResolvedValue();
        process.env.JWT_SECRET = 'test-secret';
    });
    describe('POST /api/register/signup - User Registration (UC4)', () => {
        it('should create new user with valid data (happy path)', async () => {
            const userData = {
                name: 'Alice',
                email: 'alice@example.com',
                password: 'securepassword123',
            };
            mockedGetUserByEmail.mockResolvedValue(null);
            mockedCreateUser.mockResolvedValue({
                id: 1,
                user_name: 'Alice',
                email: 'alice@example.com',
                password_hash: 'hashed-securepassword123',
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const res = await request(app)
                .post('/api/register/signup')
                .send(userData);
            expect(res.status).toBe(201);
            expect(res.body.user.id).toBe(1);
            expect(res.body.user.email).toBe('alice@example.com');
            expect(res.body.user.password_hash).toBeUndefined();
        });
        it('should not store password in plaintext', async () => {
            const userData = {
                name: 'Bob',
                email: 'bob@example.com',
                password: 'password123',
            };
            mockedGetUserByEmail.mockResolvedValue(null);
            mockedCreateUser.mockResolvedValue({
                id: 2,
                user_name: 'Bob',
                email: 'bob@example.com',
                password_hash: 'hashed-password123',
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await request(app)
                .post('/api/register/signup')
                .send(userData);
            expect(mockedBcryptHash).toHaveBeenCalled();
        });
        it('should return 409 when email already exists', async () => {
            const userData = {
                name: 'Charlie',
                email: 'taken@example.com',
                password: 'securepassword123',
            };
            mockedGetUserByEmail.mockResolvedValue({
                id: 99,
                user_name: 'Existing',
                email: 'taken@example.com',
                password_hash: 'hashed',
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const res = await request(app)
                .post('/api/register/signup')
                .send(userData);
            expect(res.status).toBe(409);
            expect(res.body.error).toContain('existing email');
        });
        it('should reject short username (< 3 chars)', async () => {
            const userData = {
                name: 'ab',
                email: 'ab@example.com',
                password: 'securepassword123',
            };
            const res = await request(app)
                .post('/api/register/signup')
                .send(userData);
            expect(res.status).toBe(400);
        });
        it('should reject invalid email', async () => {
            const userData = {
                name: 'InvalidEmail',
                email: 'not-an-email',
                password: 'securepassword123',
            };
            const res = await request(app)
                .post('/api/register/signup')
                .send(userData);
            expect(res.status).toBe(400);
        });
        it('should reject short password (< 8 chars)', async () => {
            const userData = {
                name: 'ShortPass',
                email: 'short@example.com',
                password: 'short',
            };
            const res = await request(app)
                .post('/api/register/signup')
                .send(userData);
            expect(res.status).toBe(400);
        });
        it('should set default wallet if not provided', async () => {
            const userData = {
                name: 'Wallet',
                email: 'wallet@example.com',
                password: 'securepassword123',
            };
            mockedGetUserByEmail.mockResolvedValue(null);
            mockedCreateUser.mockResolvedValue({
                id: 3,
                user_name: 'Wallet',
                email: 'wallet@example.com',
                password_hash: 'hashed',
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const res = await request(app)
                .post('/api/register/signup')
                .send(userData);
            expect(res.status).toBe(201);
            expect(res.body.user.wallet).toBeGreaterThan(0);
        });
        it('should reject missing required fields', async () => {
            const res = await request(app)
                .post('/api/register/signup')
                .send({ email: 'incomplete@example.com' });
            expect(res.status).toBe(400);
        });
    });
    describe('POST /api/register/login - User Login (UC5)', () => {
        it('should return token with valid credentials (happy path)', async () => {
            mockedGetUserByEmail.mockResolvedValue({
                id: 1,
                user_name: 'Alice',
                email: 'alice@example.com',
                password_hash: 'hashed-password123',
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockedBcryptCompare.mockResolvedValue(true);
            const res = await request(app)
                .post('/api/register/login')
                .send({
                email: 'alice@example.com',
                password: 'password123',
            });
            expect(res.status).toBe(200);
            expect(res.body.token).toBeDefined();
            expect(res.body.success).toBe(true);
        });
        it('should return valid JWT token', async () => {
            mockedGetUserByEmail.mockResolvedValue({
                id: 1,
                user_name: 'Alice',
                email: 'alice@example.com',
                password_hash: 'hashed-password123',
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockedBcryptCompare.mockResolvedValue(true);
            const res = await request(app)
                .post('/api/register/login')
                .send({
                email: 'alice@example.com',
                password: 'password123',
            });
            expect(res.status).toBe(200);
            const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
            expect(decoded.sub).toBe(1);
            expect(decoded.user_name).toBe('Alice');
            expect(decoded.role).toBe('User');
        });
        it('should return 401 for non-existent user', async () => {
            mockedGetUserByEmail.mockResolvedValue(null);
            const res = await request(app)
                .post('/api/register/login')
                .send({
                email: 'nonexistent@example.com',
                password: 'password123',
            });
            expect(res.status).toBe(401);
            expect(res.body.error).toContain('incorrect');
        });
        it('should return 401 for wrong password', async () => {
            mockedGetUserByEmail.mockResolvedValue({
                id: 1,
                user_name: 'Alice',
                email: 'alice@example.com',
                password_hash: 'hashed-password123',
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockedBcryptCompare.mockResolvedValue(false);
            const res = await request(app)
                .post('/api/register/login')
                .send({
                email: 'alice@example.com',
                password: 'wrongpassword',
            });
            expect(res.status).toBe(401);
            expect(res.body.error).toContain('incorrect');
        });
        it('should require valid email format', async () => {
            const res = await request(app)
                .post('/api/register/login')
                .send({
                email: 'not-an-email',
                password: 'password123',
            });
            expect(res.status).toBe(400);
        });
        it('should require password field', async () => {
            const res = await request(app)
                .post('/api/register/login')
                .send({ email: 'alice@example.com' });
            expect(res.status).toBe(400);
        });
    });
    describe('authorization - Protected Routes', () => {
        it('should access protected route with valid token', async () => {
            const token = createToken(1, 'User');
            const res = await request(app)
                .get('/api/user/1')
                .set('Authorization', `Bearer ${token}`);
            expect([200, 404]).toContain(res.status);
        });
        it('should reject protected route without token', async () => {
            const res = await request(app).get('/api/user/1');
            expect(res.status).toBe(401);
        });
        it('should reject protected route with invalid token', async () => {
            const res = await request(app)
                .get('/api/user/1')
                .set('Authorization', 'Bearer invalid-token');
            expect(res.status).toBe(401);
        });
        it('should work with guest token for public routes', async () => {
            mockedGetAllEvents.mockResolvedValue([]);
            const res = await request(app).get('/api/events');
            expect(res.status).toBe(200);
        });
        it('should reject admin-only routes for regular user', async () => {
            const token = createToken(1, 'User');
            const res = await request(app)
                .post('/api/user/create-admin')
                .set('Authorization', `Bearer ${token}`)
                .send({});
            expect([403, 404]).toContain(res.status);
        });
    });
    describe('Token Expiration', () => {
        it('should include expiration in token', async () => {
            mockedGetUserByEmail.mockResolvedValue({
                id: 1,
                user_name: 'Alice',
                email: 'alice@example.com',
                password_hash: 'hashed-password123',
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            mockedBcryptCompare.mockResolvedValue(true);
            const res = await request(app)
                .post('/api/register/login')
                .send({
                email: 'alice@example.com',
                password: 'password123',
            });
            expect(res.status).toBe(200);
            const decoded = jwt.decode(res.body.token);
            expect(decoded.exp).toBeDefined();
        });
    });
});
