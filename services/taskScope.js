// Ограничивает запрос задач владельцем, для администратора открывает все записи.
export function taskScope(user) {
  return user.role === 'admin' ? {} : { ownerId: user.id };
}
