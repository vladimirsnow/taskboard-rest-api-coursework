// Удаляет подтверждённую задачу и убирает её карточку с доски.
import { state } from "./state.js";
import { byId } from "./byId.js";
import { request } from "./request.js";
import { notify } from "./notify.js";
import { renderBoard } from "./renderBoard.js";

export async function deleteTask() {
  const id = byId("task-form").dataset.id;
  const revision = state.revision;
  byId("confirm-button").disabled = true;
  notify("delete-message");
  try {
    await request("/tasks/" + id, "DELETE");
    if (revision !== state.revision) return;
    for (const [index, task] of state.tasks.entries()) {
      if (String(task.id) === id) {
        state.tasks.splice(index, 1);
        break;
      }
    }
    byId("task-dialog").close();
    renderBoard();
    notify("work-message", "Задача удалена.");
  } catch (error) {
    if (revision === state.revision)
      notify("delete-message", error.message, true);
  } finally {
    byId("confirm-button").disabled = false;
  }
}
