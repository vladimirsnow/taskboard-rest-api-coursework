// Загружает открытые поля пользователей для администратора.
import { prisma } from '../config/prisma.js';
import { publicUser } from '../config/fields.js';

export async function listUsers() {
  return prisma.user.findMany({ select: publicUser, orderBy: { id: 'asc' } });
}
