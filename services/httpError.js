// Создаёт ошибку с HTTP-статусом и безопасным сообщением для клиента.
export function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}
