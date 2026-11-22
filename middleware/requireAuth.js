// Проверяет подпись и срок JWT, затем загружает текущую роль пользователя из БД.
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { publicUser } from '../config/fields.js';
import { httpError } from '../services/httpError.js';

export async function requireAuth(req, res, next) {
  const token = /^Bearer ([^ ]+)$/i.exec(req.get('authorization') ?? '')?.[1];
  let subject;
  try {
    subject = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], issuer: 'taskboard'
    }).sub;
  } catch {
    throw httpError(401, 'Войдите в систему с действующим токеном.');
  }
  const id = Number(subject);
  if (!Number.isInteger(id) || id < 1 || id > 2147483647) {
    throw httpError(401, 'Недействительная учётная запись.');
  }
  req.user = await prisma.user.findUnique({ where: { id }, select: publicUser });
  if (!req.user) throw httpError(401, 'Учётная запись больше недоступна.');
  next();
}
