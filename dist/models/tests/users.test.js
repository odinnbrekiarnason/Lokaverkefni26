import { beforeEach, describe, it, expect, vi } from 'vitest';
vi.mock('../../services/getters', () => ({
    getUserById: vi.fn(),
    getUserByEmail: vi.fn(),
    getUserByIdWoPw: vi.fn(),
    getBookingsMadeByUser: vi.fn(),
}));
vi.mock('../../models/userModel', () => ({
    editUser: vi.fn(),
    deleteUser: vi.fn(),
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
vi.mock('jasonwebtoken', () => ({
    sign: vi.fn(),
}));
import request from 'supertest';
import app from '../../app';
import { getUserById, getUserByEmail, getUserByIdWoPw } from '../../services/getters';
import { editUser, deleteUser } from '../../models/userModel';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
const mockedGetUserById = vi.mocked(getUserById);
const mockedGetUserByEmail = vi.mocked(getUserByEmail);
const mockedGetUserByIdWoPw = vi.mocked(getUserByIdWoPw);
const mockedEditUser = vi.mocked(editUser);
const mockedDeleteUser = vi.mocked(deleteUser);
const mockedBcryptHash = vi.mocked(hash);
const mockedBcryptCompare = vi.mocked(compare);
const createToken = (userId, role = 'User') => {
    return jwt.sign({
        sub: userId,
        user_name: 'testuser',
        role: role,
    }, process.env.JWT_SECRET);
};
describe('User - UC9, UC10: Update profile and delete account', () => {
    beforeEach(() => {
        mockedGetUserByEmail.mockReset();
        mockedGetUserById.mockReset();
        mockedGetUserByIdWoPw.mockReset();
        mockedEditUser.mockReset();
        mockedDeleteUser.mockReset();
        mockedBcryptCompare.mockReset();
        mockedBcryptHash.mockReset();
        mockedBcryptHash.mockResolvedValue();
    });
    describe('PUT /api/user/:user_id - Update user profile (UC9)', () => {
        it('should update username successfully', async () => {
            const token = createToken(1, 'User');
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
            const updatedUser = {
                id: 1,
                user_name: 'AliceNewName',
                email: 'alice@example.com',
                password_hash: 'hashed',
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockedGetUserById.mockResolvedValue(mockUser);
            mockedEditUser.mockResolvedValue(updatedUser);
            const res = await request(app)
                .put('/api/user/1')
                .set('Authorization', `Bearer ${token}`)
                .send({ user_name: 'AliceNewName' });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
        it('should update email successfully', async () => {
            const token = createToken(1);
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
            const updatedUser = {
                id: 1,
                user_name: 'Alice',
                email: 'alice.new@example.com',
                password_hash: 'hashed',
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockedGetUserById.mockResolvedValue(mockUser);
            mockedEditUser.mockResolvedValue(updatedUser);
            const res = await request(app)
                .put('/api/user/1')
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'alice.new@example.com' });
            expect(res.status).toBe(200);
        });
        it('should update password successfully', async () => {
            const token = createToken(1);
            const mockUser = {
                id: 1,
                user_name: 'Alice',
                email: 'alice@example.com',
                password_hash: 'hashed-old-password',
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const updatedUser = {
                id: 1,
                user_name: 'Alice',
                email: 'alice@example.com',
                password_hash: 'hashed-newpassword',
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockedGetUserById.mockResolvedValue(mockUser);
            mockedEditUser.mockResolvedValue(updatedUser);
            const res = await request(app)
                .put('/api/user/1')
                .set('Authorization', `Bearer ${token}`)
                .send({ password_hash: 'newpassword' });
            expect(res.status).toBe(200);
        });
        it('should return 400 when no fields to update', async () => {
            const token = createToken(1);
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
            mockedGetUserById.mockResolvedValue(mockUser);
            const res = await request(app)
                .put('/api/user/1')
                .set('Authorization', `Bearer ${token}`)
                .send({});
            expect(res.status).toBe(400);
        });
        it('should return 404 when user not found', async () => {
            const token = createToken(1);
            mockedGetUserById.mockResolvedValue(null);
            const res = await request(app)
                .put('/api/user/999')
                .set('Authorization', `Bearer ${token}`)
                .send({ user_name: 'NewName' });
            expect(res.status).toBe(404);
        });
        it('should return 403 when not logged in', async () => {
            const res = await request(app)
                .put('/api/user/1')
                .send({ user_name: 'NewName' });
            expect(res.status).toBe(401);
        });
        it('should reject invalid email format', async () => {
            const token = createToken(1);
            const res = await request(app)
                .put('/api/user/1')
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'not-an-email' });
            expect(res.status).toBe(400);
        });
        it('should reject short password (< 8 chars)', async () => {
            const token = createToken(1);
            const res = await request(app)
                .put('/api/user/1')
                .set('Authorization', `Bearer ${token}`)
                .send({ password: 'short' });
            expect(res.status).toBe(400);
        });
        it('should reject short username (< 3 chars)', async () => {
            const token = createToken(1);
            const res = await request(app)
                .put('/api/user/1')
                .set('Authorization', `Bearer ${token}`)
                .send({ user_name: 'ab' });
            expect(res.status).toBe(400);
        });
    });
    describe('DELETE /api/user/:user_id - Delete account (UC10)', () => {
        it('should delete account with correct credentials', async () => {
            const mockUser = {
                id: 1,
                user_name: 'Alice',
                email: 'alice@example.com',
                password_hash: 'hashed-password',
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockedGetUserByEmail.mockResolvedValue(mockUser);
            mockedGetUserById.mockResolvedValue(mockUser);
            mockedBcryptCompare.mockResolvedValue(true);
            mockedDeleteUser.mockResolvedValue();
            const token = createToken(1);
            const res = await request(app)
                .delete('/api/user/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                email: 'alice@example.com',
                password: 'password',
            });
            expect(res.status).toBe(200);
            expect(res.body.message).toContain('successfully deleted');
            expect(mockedDeleteUser).toHaveBeenCalled();
        });
        it('should return 404 when user email not found', async () => {
            mockedGetUserByEmail.mockResolvedValue(null);
            const token = createToken(1);
            const res = await request(app)
                .delete('/api/user/1')
                .set('Authorization', `Bearer ${token}`)
                .send({
                email: 'notexist@example.com',
                password_hash: 'password',
            });
            expect(res.status).toBe(404);
        });
        it('should return 401 with wrong password', async () => {
            const mockUser = {
                id: 1,
                user_name: 'Alice',
                email: 'alice@example.com',
                password_hash: 'hashed-password',
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockedGetUserByEmail.mockResolvedValue(mockUser);
            mockedBcryptCompare.mockResolvedValue(false);
            const res = await request(app)
                .delete('/api/user/1')
                .send({
                email: 'alice@example.com',
                password: 'wrongpassword',
            });
            expect(res.status).toBe(401);
        });
        it('should return 401 when missing required fields', async () => {
            const res = await request(app)
                .delete('/api/user/1')
                .send({ email: 'alice@example.com' });
            expect(res.status).toBe(401);
        });
    });
    describe('GET /api/user/:user_id - Get user info', () => {
        it('should return user info without password', async () => {
            const token = createToken(1);
            const mockUser = {
                id: 1,
                user_name: 'Alice',
                email: 'alice@example.com',
                user_role: 'User',
                wallet: 10000,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            mockedGetUserByIdWoPw.mockResolvedValue(mockUser);
            const res = await request(app).get('/api/me').set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            console.log(res.body);
            expect(res.body.id).toBe(1);
            expect(res.body.email).toBe('alice@example.com');
            expect(res.body.password_hash).toBeUndefined();
        });
        it('should return 404 when user not found', async () => {
            const token = createToken(1);
            mockedGetUserByIdWoPw.mockResolvedValue(null);
            const res = await request(app)
                .get('/api/user/999')
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(404);
        });
        it('should require authentication', async () => {
            const res = await request(app).get('/api/me');
            expect(res.status).toBe(401);
        });
    });
});
