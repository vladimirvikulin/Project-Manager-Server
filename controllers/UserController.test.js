import bcrypt from 'bcrypt';
import UserModel from '../models/User.js';
import {
  register,
  login,
  getMe
} from './UserController.js';
import { generateToken } from '../utils/generateToken/generateToken.js';

jest.mock('bcrypt');
jest.mock('../utils/generateToken/generateToken.js');
jest.mock('../models/User.js');

describe('register', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should register a user and return user data with token', async () => {
    const req = {
        body: {
            fullName: 'User1',
            email: 'user1@example.com',
            password: 'password123',
          },
      };
      const mockUser = {
        _id: 'mocked-id',
        fullName: req.body.fullName,
        email: req.body.email,
        _doc: {
          passwordHash: 'mocked-hash',
        },
      };
    const salt = 'mocked-salt';
    const hash = 'mocked-hash';
    const mockSavedUser = {
      _doc: {
        ...mockUser,
      },
      save: jest.fn().mockResolvedValue(mockUser),
    };
    const mockToken = 'mocked-token';
    bcrypt.genSalt.mockResolvedValue(salt);
    bcrypt.hash.mockResolvedValue(hash);
    UserModel.mockImplementation(() => mockSavedUser);
    generateToken.mockReturnValue(mockToken);
    const res = {

      json: jest.fn(),
    };
  
    await register(req, res);
  
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, salt);
    expect(UserModel).toHaveBeenCalledWith({
      fullName: req.body.fullName,
      email: req.body.email,
      passwordHash: hash,
    });
    expect(mockSavedUser.save).toHaveBeenCalledTimes(1);
    expect(generateToken).toHaveBeenCalledWith(mockUser);
    expect(res.json).toHaveBeenCalledWith({
      token: mockToken,
    });
  });

  it('should return an error if registration fails', async () => {
    const req = {
      body: {
        fullName: 'User1',
        email: 'user1@example.com',
        password: 'password123',
      },
    };
    const errorMessage = 'Registration failed';
    bcrypt.genSalt.mockRejectedValue(new Error(errorMessage));
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await register(req, res);

    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Не вдалося зареєструватися',
    });
  });
});

describe('login', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should log in a user and return user data with token', async () => {
    const req = {
      body: {
        email: 'user1@example.com',
        password: 'password123',
      },
    };
    const mockUser = {
      _id: 'mocked-id',
      email: req.body.email,
      _doc: {
        passwordHash: 'mocked-hash',
      },
    };
    const mockToken = 'mocked-token';
    UserModel.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    generateToken.mockReturnValue(mockToken);
    const res = {
      json: jest.fn(),
    };

    await login(req, res);

    expect(UserModel.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, mockUser._doc.passwordHash);
    expect(generateToken).toHaveBeenCalledWith(mockUser);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        token: mockToken
    }));
  });

  it('should return an error if user login fails', async () => {
    const req = {
      body: {
        email: 'user1@example.com',
        password: 'password123',
      },
    };
    const errorMessage = 'Login failed';
    UserModel.findOne.mockResolvedValue(null);
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(req, res);

    expect(UserModel.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Невірний логін або пароль',
    });
  });

  it('should return an error if password is invalid', async () => {
    const req = {
      body: {
        email: 'user1@example.com',
        password: 'password123',
      },
    };
    const mockUser = {
      _id: 'mocked-id',
      email: req.body.email,
      _doc: {
        passwordHash: 'mocked-hash',
      },
    };
    UserModel.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(req, res);

    expect(UserModel.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, mockUser._doc.passwordHash);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Невірний логін або пароль',
    });
  });

  it('should return an error if login throws an error', async () => {
    const req = {
      body: {
        email: 'user1@example.com',
        password: 'password123',
      },
    };
    const errorMessage = 'Login failed';
    UserModel.findOne.mockRejectedValue(new Error(errorMessage));
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(req, res);

    expect(UserModel.findOne).toHaveBeenCalledWith({ email: req.body.email });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Не вдалося авторизуватися',
    });
  });
});

describe('getMe', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return user data for a valid user ID', async () => {
    const req = {
      userId: 'mocked-id',
    };
    const mockUser = {
      _id: req.userId,
      _doc: {
        fullName: 'User1',
        email: 'user1@example.com',
      },
    };
    UserModel.findById.mockResolvedValue(mockUser);
    const res = {
      json: jest.fn(),
    };

    await getMe(req, res);

    expect(UserModel.findById).toHaveBeenCalledWith(req.userId);
    expect(res.json).toHaveBeenCalledWith({
      fullName: mockUser._doc.fullName,
      email: mockUser._doc.email,
    });
  });

  it('should return an error if user ID is invalid', async () => {
    const req = {
      userId: 'invalid-id',
    };
    UserModel.findById.mockResolvedValue(null);
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getMe(req, res);

    expect(UserModel.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Невірний логін або пароль',
    });
  });

  it('should return an error if getMe throws an error', async () => {
    const req = {
      userId: 'mocked-id',
    };
    const errorMessage = 'Access denied';
    UserModel.findById.mockRejectedValue(new Error(errorMessage));
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await getMe(req, res);

    expect(UserModel.findById).toHaveBeenCalledWith(req.userId);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Нема доступа',
    });
  });
});
