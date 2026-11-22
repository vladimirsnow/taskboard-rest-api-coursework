// Пропускает к административному справочнику только администратора.
import { httpError } from '../services/httpError.js';

export function requireRole(req, res, next) {
  if (req.user.role !== 'admin') throw httpError(403, 'Нужны права администратора.');
  next();
}
