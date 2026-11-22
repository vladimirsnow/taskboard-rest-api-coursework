// Задаёт допустимые поля, типы и длину строк для запросов.
import { z } from 'zod';

const positiveId = z.number().int().min(1).max(2147483647);
const email = z.string().trim().email().max(254).toLowerCase();
const password = z.string().min(10).max(128);
export const registerSchema = z.object({
  email, password, name: z.string().trim().min(1).max(80)
}).strict();
export const loginSchema = z.object({ email, password }).strict();
export const createSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional(),
  projectId: positiveId,
  status: z.enum(['TODO', 'DOING', 'DONE']).optional()
}).strict();
export const updateSchema = createSchema.partial();
export const idSchema = z.string().regex(/^[1-9][0-9]*$/).pipe(z.coerce.number().pipe(positiveId));
