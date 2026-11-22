// Проверяет идентификатор и переданные изменения.
import { updateTask } from '../services/updateTask.js';
import { idSchema, updateSchema } from '../config/schemas.js';

export async function patchTask(req, res) {
  const task = await updateTask(idSchema.parse(req.params.id), updateSchema.parse(req.body), req.user);
  res.status(200).json({ task });
}
