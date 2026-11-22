// Отправляет справочник проектов.
import { listProjects } from '../services/listProjects.js';

export async function getProjects(req, res) {
  const projects = await listProjects();
  res.status(200).json({ projects });
}
