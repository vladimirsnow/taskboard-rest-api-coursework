// Удаляет задачу и возвращает подтверждение.
import { deleteTask } from '../services/deleteTask.js';
import { idSchema } from '../config/schemas.js';

export async function removeTask(req, res) {
  const result = await deleteTask(idSchema.parse(req.params.id), req.user);
  res.status(200).json(result);
}
