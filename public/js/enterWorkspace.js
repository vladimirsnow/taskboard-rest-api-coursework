// Загружает данные после входа и открывает доску текущего пользователя.
import { state } from "./state.js";
import { byId } from "./byId.js";
import { loadWorkspace } from "./loadWorkspace.js";
import { showView } from "./showView.js";
import { notify } from "./notify.js";

export async function enterWorkspace() {
  const revision = state.revision;
  try {
    await loadWorkspace();
    if (revision !== state.revision) return;
    byId("account-name").textContent = state.user.name;
    byId("users-nav").hidden = state.user.role !== "admin";
    byId("auth-screen").hidden = true;
    byId("work-screen").hidden = false;
    await showView("tasks");
  } catch (error) {
    if (state.token) notify("auth-message", error.message, true);
  }
}
