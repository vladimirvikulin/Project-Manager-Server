import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import middleware from './checkAuth';
dotenv.config();

describe('Authentication middleware', () => {
  it('should pass authentication with valid token', () => {
    const userId = '123456789';
    const token = jwt.sign({ _id: userId }, process.env.ID_KEY);
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    };
    const res = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(req.userId).toBe(userId);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should reject authentication with invalid token', () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid_token',
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Нема доступа',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject authentication without token', () => {
    const req = {
      headers: {},
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Нема доступа',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
