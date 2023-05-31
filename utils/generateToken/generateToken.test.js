import jwt from 'jsonwebtoken';
import { generateToken } from './generateToken';

jest.mock('jsonwebtoken');

describe('generateToken', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should generate a token with the correct payload and options', () => {
    const user = {
      _id: '123456789',
    };
    const expiresIn = '30d';
    const mockToken = 'mocked-token';
    const signMock = jest.spyOn(jwt, 'sign').mockReturnValue(mockToken);

    const token = generateToken(user);

    expect(signMock).toHaveBeenCalledTimes(1);
    expect(signMock).toHaveBeenCalledWith(
      {
        _id: user._id,
      },
      process.env.ID_KEY,
      {
        expiresIn,
      }
    );
    expect(token).toBe(mockToken);
  });

  it('should throw an error if jwt.sign throws an error', () => {
    const user = {
      _id: '123456789',
    };
    const errorMessage = 'Token generation failed';
    const signMock = jest.spyOn(jwt, 'sign').mockImplementation(() => {
      throw new Error(errorMessage);
    });

    expect(() => generateToken(user)).toThrow(errorMessage);
    expect(signMock).toHaveBeenCalledTimes(1);
    expect(signMock).toHaveBeenCalledWith(
      {
        _id: user._id,
      },
      process.env.ID_KEY,
      {
        expiresIn: '30d',
      }
    );
  });
});