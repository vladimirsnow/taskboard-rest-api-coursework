// Отправляет справочник пользователей администратору.
import { listUsers } from '../services/listUsers.js';

export async function getUsers(req, res) {
  const users = await listUsers();
  res.status(200).json({ users });
}
