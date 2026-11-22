// Выбирает рабочий раздел и запрашивает административные данные при открытии.
import { state } from "./state.js";
import { byId } from "./byId.js";
import { notify } from "./notify.js";
import { request } from "./request.js";
import { renderDirectory } from "./renderDirectory.js";
import { renderBoard } from "./renderBoard.js";

export async function showView(view) {
  const revision = state.revision;
  if (view === "users" && state.user?.role !== "admin") return;
  state.view = view;
  notify("work-message");
  const titles = {
    tasks: "Доска задач",
    projects: "Проекты",
    users: "Пользователи",
  };
  byId("view-title").textContent = titles[view];
  byId("task-view").hidden = view !== "tasks";
  byId("add-task").hidden = view !== "tasks";
  byId("directory-view").hidden = view === "tasks";
  for (const button of document.querySelectorAll("[data-view]")) {
    if (button.dataset.view === view)
      button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  }
  if (view === "tasks") {
    renderBoard();
    return;
  }
  if (view === "users") {
    byId("directory").textContent = "Загрузка пользователей…";
    try {
      const data = await request("/admin/users");
      if (revision !== state.revision || state.view !== view) return;
      state.users = data.users;
    } catch (error) {
      if (revision === state.revision && state.view === view) {
        byId("directory").replaceChildren();
        notify("work-message", error.message, true);
      }
      return;
    }
  }
  renderDirectory();
}
