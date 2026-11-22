// Создаёт общий клиент Prisma для запросов к базе.
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
