// Завершает сеанс вкладки, очищает личные данные и возвращает форму входа.
import { state } from "./state.js";
import { byId } from "./byId.js";
import { setAuthMode } from "./setAuthMode.js";
import { notify } from "./notify.js";

export function logout() {
  state.revision++;
  Object.assign(state, {
    user: null,
    token: "",
    tasks: [],
    projects: [],
    users: [],
    view: "tasks",
  });
  sessionStorage.removeItem("kontur-session");
  byId("task-dialog").close();
  byId("task-form").reset();
  byId("board").replaceChildren();
  byId("directory").replaceChildren();
  byId("search").value = "";
  byId("status-filter").value = "";
  byId("auth-form").reset();
  byId("work-screen").hidden = true;
  byId("auth-screen").hidden = false;
  setAuthMode("login");
  notify("work-message");
}
