import { User } from '../models/user.model';
import { generateToken } from '../utils/jwt';

// Mock temporal
const users: User[] = [
//   { id: 1, email: 'admin@example.com', password: 'admin123' } // reemplazar por hash
];

export function login(email: string, password: string) {
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Credenciales inválidas');

  const token = generateToken({ id: user.id, email: user.email });
  return { token };
}
