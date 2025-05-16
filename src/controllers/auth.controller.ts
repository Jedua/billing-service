import { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';

export function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const { token } = AuthService.login(email, password);
    res.json({ token });
  } catch (err: any) {
    res.status(401).json({ message: err.message });
  }
}
