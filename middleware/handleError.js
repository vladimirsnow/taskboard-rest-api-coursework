// Переводит ошибки в единый JSON-формат и скрывает внутренние детали.
import { ZodError } from 'zod';

export function handleError(error, req, res, next) {
  if (res.headersSent) return next(error);
  let status = 500;
  let message = 'Внутренняя ошибка сервера.';
  if (error instanceof ZodError) {
    status = 400;
    const field = error.issues[0]?.path.join('.');
    message = field ? `Проверьте поле «${field}».` : 'Некорректный набор полей запроса.';
  } else if (error.type === 'entity.parse.failed' || error.type === 'entity.too.large') {
    status = 400;
    message = 'Проверьте формат JSON и размер тела запроса.';
  } else if (error.code === 'P2002') {
    status = 409;
    message = 'Эта запись уже существует.';
  } else if (error.code === 'P2003') {
    status = 400;
    message = 'Указанный проект недоступен.';
  } else if (error.code === 'P2025') {
    status = 404;
    message = 'Задача не найдена.';
  } else if ([400, 401, 403, 404].includes(error.status)) {
    status = error.status;
    message = error.message;
  }
  if (status === 500) console.error('Ошибка запроса:', error.code ?? error.name);
  if (status === 401) res.set('WWW-Authenticate', 'Bearer');
  res.status(status).json({ error: { message } });
}
