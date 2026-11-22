// Передаёт нажатие кнопки соответствующему действию интерфейса.
import { byId } from "./byId.js";
import { setAuthMode } from "./setAuthMode.js";
import { showView } from "./showView.js";
import { logout } from "./logout.js";
import { openEditor } from "./openEditor.js";
import { deleteTask } from "./deleteTask.js";
import { notify } from "./notify.js";

export async function handleClick(event) {
  const button = event.target.closest("button");
  if (!button || button.disabled) return;
  const { mode, view, projectId, taskId } = button.dataset;
  if (mode) return setAuthMode(mode);
  if (view) return showView(view);
  if (projectId) {
    byId("project-filter").value = projectId;
    byId("search").value = "";
    byId("status-filter").value = "";
    return showView("tasks");
  }
  if (taskId) return openEditor(taskId);
  const form = byId("task-form");
  switch (button.id) {
    case "logout":
      return logout();
    case "add-task":
      return openEditor();
    case "close-dialog":
      return byId("task-dialog").close();
    case "delete-task":
      form.hidden = true;
      byId("confirm-delete").hidden = false;
      byId("delete-description").textContent =
        "«" + form.elements.namedItem("title").value + "» будет удалена.";
      notify("delete-message");
      byId("cancel-delete").focus();
      break;
    case "cancel-delete":
      byId("confirm-delete").hidden = true;
      form.hidden = false;
      byId("delete-task").focus();
      break;
    case "confirm-button":
      return deleteTask();
  }
}
