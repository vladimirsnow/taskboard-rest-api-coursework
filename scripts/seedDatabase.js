// Готовит справочник, администратора и демонстрационную доску при первом создании аккаунта.
import { hash, Algorithm } from '@node-rs/argon2';
import { prisma } from '../config/prisma.js';

const { ADMIN_EMAIL, ADMIN_PASSWORD, DEMO_EMAIL, DEMO_PASSWORD } = process.env;
if (!ADMIN_EMAIL || !DEMO_EMAIL || ADMIN_EMAIL === DEMO_EMAIL ||
    !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 10 || !DEMO_PASSWORD || DEMO_PASSWORD.length < 10) {
  throw new Error('Проверьте реквизиты двух разных учебных аккаунтов в .env.');
}
try {
  const projects = [];
  for (const name of ['Разработка API', 'Веб-интерфейс', 'Документация']) {
    projects.push(await prisma.project.upsert({ where: { name }, update: {}, create: { name } }));
  }
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) {
    await prisma.user.create({ data: { name: 'Администратор', email: ADMIN_EMAIL, role: 'admin',
      passwordHash: await hash(ADMIN_PASSWORD, { algorithm: Algorithm.Argon2id }) } });
  } else if (admin.role !== 'admin') {
    throw new Error('Административный email уже занят обычной учётной записью.');
  }
  if (!(await prisma.user.findUnique({ where: { email: DEMO_EMAIL } }))) {
    const tasks = [];
    for (const [title, description, status, index] of [
      ['Описать коды ошибок', 'Добавить в справочник примеры ответов 401 и 403.', 'TODO', 2],
      ['Сверить подписи полей', 'Проверить названия в карточке редактирования.', 'TODO', 1],
      ['Согласовать поля задачи', 'Определить обязательные поля для создания записи.', 'DOING', 0],
      ['Проверить форму входа', 'Пройти сценарии с клавиатуры и проверить ошибки.', 'DOING', 1],
      ['Подготовить схему данных', 'Связать задачи с проектами и исполнителями.', 'DONE', 0]
    ]) {
      tasks.push({ title, description, status, projectId: projects[index].id });
    }
    await prisma.user.create({ data: { name: 'Исполнитель', email: DEMO_EMAIL,
      passwordHash: await hash(DEMO_PASSWORD, { algorithm: Algorithm.Argon2id }), tasks: { create: tasks } } });
  }
} finally {
  await prisma.$disconnect();
}
