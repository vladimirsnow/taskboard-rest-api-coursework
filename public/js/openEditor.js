// Открывает новую задачу или запрашивает карточку по идентификатору.
import { state } from "./state.js";
import { byId } from "./byId.js";
import { request } from "./request.js";
import { notify } from "./notify.js";

export async function openEditor(id) {
  const revision = state.revision;
  const form = byId("task-form");
  const dialog = byId("task-dialog");
  notify("work-message");
  try {
    const task = id ? (await request("/tasks/" + id)).task : null;
    if (state.revision !== revision || dialog.open || state.view !== "tasks")
      return;
    form.reset();
    form.hidden = false;
    byId("confirm-delete").hidden = true;
    byId("task-heading").textContent = task
      ? "Редактировать задачу"
      : "Новая задача";
    byId("delete-task").hidden = !task;
    form.dataset.id = task ? String(task.id) : "";
    form.elements.namedItem("title").value = task?.title ?? "";
    form.elements.namedItem("description").value = task?.description ?? "";
    const select = form.elements.namedItem("projectId");
    if (task) select.value = String(task.projectId);
    else if (byId("project-filter").value)
      select.value = byId("project-filter").value;
    form.elements.namedItem("status").value =
      task?.status ?? (byId("status-filter").value || "TODO");
    notify("task-message");
    dialog.showModal();
    form.elements.namedItem("title").focus();
  } catch (error) {
    if (revision === state.revision)
      notify("work-message", error.message, true);
  }
}
