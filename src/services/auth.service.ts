import bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { generateToken } from '../utils/jwt';

export async function login(email: string, password: string) {
  // 1) Buscar usuario por email
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Credenciales inválidas');

  // 2) Comparar password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Credenciales inválidas');

  // 3) Generar JWT (puedes incluir role si lo necesitas)
  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  return { token };
}
