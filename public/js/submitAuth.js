// Регистрирует пользователя либо получает JWT и открывает рабочее пространство.
import { state } from "./state.js";
import { byId } from "./byId.js";
import { request } from "./request.js";
import { setAuthMode } from "./setAuthMode.js";
import { notify } from "./notify.js";
import { enterWorkspace } from "./enterWorkspace.js";

export async function submitAuth(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const values = new FormData(form);
  const body = {
    email: String(values.get("email")).trim(),
    password: String(values.get("password")),
  };
  const signup = state.mode === "register";
  if (signup) body.name = String(values.get("name")).trim();
  const submit = byId("auth-submit");
  submit.disabled = true;
  byId("mode-login").disabled = true;
  byId("mode-register").disabled = true;
  notify("auth-message");
  try {
    if (signup) {
      await request("/auth/register", "POST", body);
      setAuthMode("login");
      form.elements.namedItem("password").value = "";
      form.elements.namedItem("password").focus();
      notify("auth-message", "Аккаунт создан. Введите пароль для входа.");
    } else {
      const data = await request("/auth/login", "POST", body);
      state.user = data.user;
      state.token = data.accessToken;
      state.revision++;
      sessionStorage.setItem(
        "kontur-session",
        JSON.stringify({ user: state.user, token: state.token }),
      );
      form.elements.namedItem("password").value = "";
      await enterWorkspace();
    }
  } catch (error) {
    notify("auth-message", error.message, true);
  } finally {
    submit.disabled = false;
    byId("mode-login").disabled = false;
    byId("mode-register").disabled = false;
  }
}
