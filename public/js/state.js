// Хранит состояние открытой вкладки и подписи статусов.

export const state = {
  user: null,
  token: "",
  projects: [],
  tasks: [],
  users: [],
  view: "tasks",
  mode: "login",
  revision: 0,
};
export const statuses = {
  TODO: "К выполнению",
  DOING: "В работе",
  DONE: "Готово",
};
