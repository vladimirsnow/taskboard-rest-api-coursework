// Сверяет пароль и выдаёт подписанный JWT на один час.
import { verify } from '@node-rs/argon2';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { httpError } from './httpError.js';

export async function loginUser({ email, password }) {
  const account = await prisma.user.findUnique({ where: { email } });
  if (!account || !(await verify(account.passwordHash, password))) {
    throw httpError(401, 'Неверная почта или пароль.');
  }
  const { id, name, role } = account;
  const accessToken = jwt.sign({}, process.env.JWT_SECRET, {
    subject: String(id), algorithm: 'HS256', expiresIn: '1h', issuer: 'taskboard'
  });
  return { user: { id, name, role, email }, accessToken };
}
