// Возвращает ошибку для неизвестного адреса API.
import { httpError } from '../services/httpError.js';

export function notFound() {
  throw httpError(404, 'Маршрут не найден.');
}
