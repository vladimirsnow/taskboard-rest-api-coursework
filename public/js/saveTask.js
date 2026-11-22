// Сохраняет задачу через POST или PATCH и отображает ответ сервера на доске.
import { state } from "./state.js";
import { byId } from "./byId.js";
import { request } from "./request.js";
import { notify } from "./notify.js";
import { renderBoard } from "./renderBoard.js";

export async function saveTask(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const id = form.dataset.id;
  const values = new FormData(form);
  const body = {
    title: String(values.get("title")).trim(),
    description: String(values.get("description")).trim(),
    projectId: Number(values.get("projectId")),
    status: values.get("status"),
  };
  const revision = state.revision;
  const submit = form.querySelector("[type=submit]");
  submit.disabled = true;
  notify("task-message");
  try {
    const { task } = await request(
      id ? "/tasks/" + id : "/tasks",
      id ? "PATCH" : "POST",
      body,
    );
    if (revision !== state.revision) return;
    for (const [index, item] of state.tasks.entries()) {
      if (item.id === task.id) {
        state.tasks.splice(index, 1);
        break;
      }
    }
    state.tasks.unshift(task);
    byId("task-dialog").close();
    renderBoard();
    notify("work-message", id ? "Изменения сохранены." : "Задача создана.");
  } catch (error) {
    if (revision === state.revision)
      notify("task-message", error.message, true);
  } finally {
    submit.disabled = false;
  }
}
