// Назначает вошедшего пользователя исполнителем новой задачи.
import { prisma } from '../config/prisma.js';
import { taskRelations } from '../config/fields.js';

export async function createTask(data, user) {
  return prisma.task.create({ data: { ...data, ownerId: user.id }, include: taskRelations });
}
