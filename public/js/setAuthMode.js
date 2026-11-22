// Переключает формы регистрации и входа и обновляет правила заполнения.
import { state } from "./state.js";
import { byId } from "./byId.js";
import { notify } from "./notify.js";

export function setAuthMode(mode) {
  state.mode = mode;
  const signup = mode === "register";
  const form = byId("auth-form");
  const name = form.elements.namedItem("name");
  const password = form.elements.namedItem("password");
  byId("name-field").hidden = !signup;
  name.required = signup;
  name.disabled = !signup;
  password.minLength = 10;
  password.autocomplete = signup ? "new-password" : "current-password";
  byId("password-hint").hidden = !signup;
  byId("mode-login").setAttribute("aria-pressed", String(!signup));
  byId("mode-register").setAttribute("aria-pressed", String(signup));
  byId("auth-heading").textContent = signup
    ? "Создать аккаунт"
    : "Войти в аккаунт";
  byId("auth-submit").textContent = signup ? "Зарегистрироваться" : "Войти";
  notify("auth-message");
}
