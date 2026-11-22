// Хеширует пароль Argon2id и создаёт пользователя с обычной ролью.
import { hash, Algorithm } from '@node-rs/argon2';
import { prisma } from '../config/prisma.js';
import { publicUser } from '../config/fields.js';

export async function registerUser({ name, email, password }) {
  const passwordHash = await hash(password, { algorithm: Algorithm.Argon2id });
  return prisma.user.create({ data: { name, email, passwordHash }, select: publicUser });
}
