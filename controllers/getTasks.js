// Отправляет список доступных задач.
import { listTasks } from '../services/listTasks.js';

export async function getTasks(req, res) {
  const tasks = await listTasks(req.user);
  res.status(200).json({ tasks });
}
