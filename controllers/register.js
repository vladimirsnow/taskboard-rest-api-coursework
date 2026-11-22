// Регистрирует пользователя по проверенному телу запроса.
import { registerUser } from '../services/registerUser.js';
import { registerSchema } from '../config/schemas.js';

export async function register(req, res) {
  const user = await registerUser(registerSchema.parse(req.body));
  res.status(201).json({ user });
}
