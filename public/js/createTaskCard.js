// Создаёт кнопку карточки с проектом, названием задачи и исполнителем.

export function createTaskCard(task) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "task-card";
  button.dataset.taskId = task.id;
  const project = document.createElement("span");
  project.className = "task-project";
  project.textContent = task.project.name;
  const title = document.createElement("strong");
  title.textContent = task.title;
  const owner = document.createElement("small");
  owner.textContent = "Исполнитель · " + task.owner.name;
  button.append(project, title, owner);
  return button;
}
