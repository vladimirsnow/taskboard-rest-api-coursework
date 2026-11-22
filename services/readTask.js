// Читает одну доступную задачу вместе с проектом и исполнителем.
import { prisma } from '../config/prisma.js';
import { taskScope } from './taskScope.js';
import { taskRelations } from '../config/fields.js';

export async function readTask(id, user) {
  return prisma.task.findUniqueOrThrow({ where: { id, ...taskScope(user) }, include: taskRelations });
}
