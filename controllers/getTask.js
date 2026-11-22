// Возвращает задачу по числовому идентификатору.
import { readTask } from '../services/readTask.js';
import { idSchema } from '../config/schemas.js';

export async function getTask(req, res) {
  const task = await readTask(idSchema.parse(req.params.id), req.user);
  res.status(200).json({ task });
}
