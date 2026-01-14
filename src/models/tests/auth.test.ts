import { beforeEach, expect, it, describe, vi} from 'vitest';

vi.mock('../../services/getters/userGetters', async() => ({
  getUserByEmail: vi.fn(),
  getMyEvents: vi.fn(),
}));

vi.mock('../../models/userModel', async() => ({
  createUser: vi.fn(),
}));

vi.mock('bcrypt', async() => {
  const hash = vi.fn(async (_pw: string, _rounds?: number) => 'hashed-newpassword');
  const compare = vi.fn(async () => true);
  return {
    default: { hash, compare },
    hash,
    compare,
  };
});



import request from 'supertest';
import app from '../../app';
import { getUserByEmail } from '../../services/getters/userGetters';
import { createUser } from '../../models/userModel';
import {compare, hash} from 'bcrypt';
import jwt from 'jsonwebtoken';

const mockedGetUserByEmail = vi.mocked(getUserByEmail);
const mockedCreateUser = vi.mocked(createUser);
const mockedBcryptCompare = vi.mocked(compare);
const mockedBcryptHash = vi.mocked(hash);

describe('Auth routes', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('signup - happy path', async () => {
    mockedGetUserByEmail.mockResolvedValue(null);
    mockedCreateUser.mockResolvedValue({
      id: 1, user_name: 'Alice', email: 'a@a.com', password_hash: '', user_role: 'User', wallet: 10000, createdAt: new Date(), updatedAt: new Date()
    });
    
    const res = await request(app).post('/api/register/signup').send({ user_name: 'Alice', email: 'a@a.com', password_hash: 'password' });
    expect(res.body.user.email).toBe('a@a.com');
    expect(res.status).toBe(201);
    expect(mockedBcryptHash).toHaveBeenCalled();
    expect(res.body.user.password_hash).toBeUndefined();
  });

  it('signup - existing email -> 409', async () => {
    mockedGetUserByEmail.mockResolvedValue({
      id: 1, user_name: 'Alice', email: 'b@b.com', password_hash: 'x', user_role: 'User', wallet: 10000, createdAt: new Date(), updatedAt: new Date()
    });
    const res = await request(app)
      .post('/api/register/signup')
      .send({ user_name: 'Bob', email: 'b@b.com', password_hash: 'password' });
    expect(res.status).toBe(409);
  });

  it('login - happy path returns token', async () => {
    mockedGetUserByEmail.mockResolvedValue({
      id: 3, user_name: 'bob', password_hash: 'hashed_password', user_role: 'User',
      email: 'b@b.com',
      wallet: 10000,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    mockedBcryptCompare.mockResolvedValue(true as any);
    const res = await request(app)
      .post('/api/register/login')
      .send({ email: 'b@b.com', password_hash: 'password' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    const decoded: any = jwt.verify(res.body.token, process.env.JWT_SECRET!);
    expect(decoded.sub).toBe(3);
  });

  it('login - wrong credentials -> 401', async () => {
    mockedGetUserByEmail.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/register/login')
      .send({ email: 'no@one.com', password_hash: 'password' });
    expect(res.status).toBe(401);
  });
});