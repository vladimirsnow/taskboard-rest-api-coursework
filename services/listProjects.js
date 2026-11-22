// Возвращает справочник проектов в алфавитном порядке.
import { prisma } from '../config/prisma.js';

export async function listProjects() {
  return prisma.project.findMany({ orderBy: { name: 'asc' } });
}
