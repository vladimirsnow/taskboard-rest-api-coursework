// Изменяет доступную задачу с проверкой владельца внутри операции записи.
import { prisma } from '../config/prisma.js';
import { taskScope } from './taskScope.js';
import { taskRelations } from '../config/fields.js';
import { httpError } from './httpError.js';

export async function updateTask(id, data, user) {
  if (!Object.keys(data).length) throw httpError(400, 'Укажите хотя бы одно поле.');
  return prisma.task.update({ where: { id, ...taskScope(user) }, data, include: taskRelations });
}
