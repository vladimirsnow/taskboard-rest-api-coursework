// Удаляет доступную задачу с проверкой владельца.
import { prisma } from '../config/prisma.js';
import { taskScope } from './taskScope.js';

export async function deleteTask(id, user) {
  await prisma.task.delete({ where: { id, ...taskScope(user) } });
  return { deleted: true };
}
