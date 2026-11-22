// Выводит задачи по колонкам с учётом поиска, проекта и выбранного статуса.
import { state, statuses } from "./state.js";
import { byId } from "./byId.js";
import { createTaskCard } from "./createTaskCard.js";

export function renderBoard() {
  const board = byId("board");
  const search = byId("search").value.trim().toLocaleLowerCase("ru");
  const project = byId("project-filter").value;
  const statusFilter = byId("status-filter").value;
  board.replaceChildren();
  for (const [status, label] of Object.entries(statuses)) {
    if (statusFilter && statusFilter !== status) continue;
    const column = document.createElement("section");
    column.className = "column";
    column.dataset.status = status;
    const head = document.createElement("div");
    head.className = "column-head";
    const icon = document.createElement("span");
    icon.className = "status-icon";
    icon.setAttribute("aria-hidden", "true");
    const title = document.createElement("h2");
    title.textContent = label;
    const count = document.createElement("span");
    count.className = "count";
    head.append(icon, title, count);
    column.append(head);
    let total = 0;
    for (const task of state.tasks) {
      if (
        task.status !== status ||
        (project && String(task.projectId) !== project)
      )
        continue;
      const text = [task.title, task.description, task.owner.name]
        .join(" ")
        .toLocaleLowerCase("ru");
      if (search && !text.includes(search)) continue;
      column.append(createTaskCard(task));
      total++;
    }
    count.textContent = total;
    if (total === 0) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent =
        search || project ? "Совпадений нет" : "Пока нет задач";
      column.append(empty);
    }
    board.append(column);
  }
}
