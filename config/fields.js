// Ограничивает открытые поля профиля и связанных записей.
export const publicUser = { id: true, name: true, email: true, role: true };
export const taskRelations = {
  project: { select: { id: true, name: true } },
  owner: { select: { id: true, name: true } }
};
