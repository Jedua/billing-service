import { Request, Response } from 'express';
import * as AuthService from '../services/auth.service';
import { User } from '../models/user.model';

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    const { token } = await AuthService.login(email, password);
    return res.json({ token });
  } catch (err: any) {
    return res.status(401).json({ message: err.message });
  }
}

export async function register(req: Request, res: Response) {
  const { name, email, password, virwocloudUserId } = req.body;
  try {
    // Verifica si el email ya está registrado
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: 'El correo ya está registrado.' });

    // Si viene el virwocloudUserId lo pasa, si no, lo ignora
    const user = await User.create({ name, email, password, virwocloudUserId }); // el hook hashea la password

    // Opcional: no devolver la contraseña en la respuesta
    return res.status(201).json({ id: user.id, name: user.name, email: user.email, virwocloudUserId: user.virwocloudUserId });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
}
