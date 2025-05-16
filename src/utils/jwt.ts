import jwt, { SignOptions } from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'changeme';
const expiresIn = process.env.JWT_EXPIRES_IN || '1h';

export function generateToken(payload: object): string {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn']
  };
  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string): any {
  return jwt.verify(token, secret);
}
