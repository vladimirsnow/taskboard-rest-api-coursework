// Отправляет JSON-запрос к REST API и обрабатывает ошибки, включая истечение сессии.
import { state } from "./state.js";
import { logout } from "./logout.js";
import { notify } from "./notify.js";

export async function request(path, method = "GET", body) {
  const token = state.token;
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = "Bearer " + token;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const response = await fetch("/api" + path, {
    method,
    headers,
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 && token && state.token === token) {
      logout();
      notify("auth-message", "Сеанс завершён. Войдите снова.", true);
    }
    throw new Error(data.error?.message || "Не удалось выполнить запрос.");
  }
  return data;
}
