// Возвращает профиль и токен при успешном входе.
import { loginUser } from '../services/loginUser.js';
import { loginSchema } from '../config/schemas.js';

export async function login(req, res) {
  const result = await loginUser(loginSchema.parse(req.body));
  res.status(200).json(result);
}
