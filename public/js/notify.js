// Показывает сообщение об успехе или ошибке в указанной области.
import { byId } from "./byId.js";

export function notify(area, text = "", error = false) {
  const element = byId(area);
  element.textContent = text;
  element.classList.toggle("error", error);
}
