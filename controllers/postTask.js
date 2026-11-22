// Принимает поля для создания задачи.
import { createTask } from '../services/createTask.js';
import { createSchema } from '../config/schemas.js';

export async function postTask(req, res) {
  const task = await createTask(createSchema.parse(req.body), req.user);
  res.status(201).json({ task });
}
