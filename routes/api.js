// Связывает HTTP-методы с контроллерами и проверками доступа.
import express from 'express';
import { register } from '../controllers/register.js';
import { login } from '../controllers/login.js';
import { getTasks } from '../controllers/getTasks.js';
import { getTask } from '../controllers/getTask.js';
import { postTask } from '../controllers/postTask.js';
import { patchTask } from '../controllers/patchTask.js';
import { removeTask } from '../controllers/removeTask.js';
import { getProjects } from '../controllers/getProjects.js';
import { getUsers } from '../controllers/getUsers.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { notFound } from '../middleware/notFound.js';

export const api = express.Router();
api.post('/auth/register', register);
api.post('/auth/login', login);
api.route('/tasks').get(requireAuth, getTasks).post(requireAuth, postTask);
api.route('/tasks/:id').get(requireAuth, getTask).patch(requireAuth, patchTask).delete(requireAuth, removeTask);
api.get('/projects', requireAuth, getProjects);
api.get('/admin/users', requireAuth, requireRole, getUsers);
api.use(notFound);
