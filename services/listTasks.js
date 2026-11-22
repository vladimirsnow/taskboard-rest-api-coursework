// Получает задачи, доступные текущему пользователю.
import { prisma } from '../config/prisma.js';
import { taskScope } from './taskScope.js';
import { taskRelations } from '../config/fields.js';

export async function listTasks(user) {
  return prisma.task.findMany({ where: taskScope(user), include: taskRelations, orderBy: { id: 'desc' } });
}
