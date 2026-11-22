// Показывает проекты с количеством доступных задач или справочник пользователей.
import { state } from "./state.js";
import { byId } from "./byId.js";

export function renderDirectory() {
  const directory = byId("directory");
  directory.replaceChildren();
  const projects = state.view === "projects";
  const items = projects ? state.projects : state.users;
  for (const item of items) {
    const card = document.createElement(projects ? "button" : "article");
    const title = document.createElement("strong");
    title.textContent = item.name;
    const detail = document.createElement("small");
    if (projects) {
      card.type = "button";
      card.dataset.projectId = item.id;
      let count = 0;
      for (const task of state.tasks) if (task.projectId === item.id) count++;
      detail.textContent = "Доступных задач: " + count;
    } else {
      const role = item.role === "admin" ? "Администратор" : "Пользователь";
      detail.textContent = item.email + " · " + role;
    }
    card.append(title, detail);
    directory.append(card);
  }
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = projects
      ? "В справочнике пока нет проектов."
      : "Пользователей пока нет.";
    directory.append(empty);
  }
}
