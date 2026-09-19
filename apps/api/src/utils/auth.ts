import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'flour-erp-jwt-secret-key-counter-shift-2026';
const JWT_EXPIRES_IN = '12h';

export interface TokenPayload {
  userId: string;
  username: string;
  roleId: string;
  roleName: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const hashPin = async (pin: string): Promise<string> => {
  return bcrypt.hash(pin, 10);
};

export const comparePin = async (pin: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(pin, hash);
};

export const signToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
