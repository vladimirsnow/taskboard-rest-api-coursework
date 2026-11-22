// Подключает обработчики страницы и при наличии сеанса восстанавливает доску.
import { state } from "./state.js";
import { byId } from "./byId.js";
import { handleClick } from "./handleClick.js";
import { submitAuth } from "./submitAuth.js";
import { saveTask } from "./saveTask.js";
import { renderBoard } from "./renderBoard.js";
import { enterWorkspace } from "./enterWorkspace.js";

document.addEventListener("click", handleClick);
byId("auth-form").addEventListener("submit", submitAuth);
byId("task-form").addEventListener("submit", saveTask);
byId("search").addEventListener("input", renderBoard);
byId("project-filter").addEventListener("change", renderBoard);
byId("status-filter").addEventListener("change", renderBoard);
try {
  const session = JSON.parse(sessionStorage.getItem("kontur-session"));
  if (session?.token && session.user?.name) {
    state.token = session.token;
    state.user = session.user;
    await enterWorkspace();
  }
} catch {
  sessionStorage.removeItem("kontur-session");
}
