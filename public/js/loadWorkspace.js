// Получает проекты и задачи и обновляет варианты выбора проекта.
import { state } from "./state.js";
import { byId } from "./byId.js";
import { request } from "./request.js";

export async function loadWorkspace() {
  const revision = state.revision;
  const [projectData, taskData] = await Promise.all([
    request("/projects"),
    request("/tasks"),
  ]);
  if (revision !== state.revision) return;
  state.projects = projectData.projects;
  state.tasks = taskData.tasks;
  const filter = byId("project-filter");
  const previous = filter.value;
  const editor = byId("task-form").elements.namedItem("projectId");
  filter.replaceChildren(new Option("Все проекты", ""));
  editor.replaceChildren();
  for (const project of state.projects) {
    filter.add(new Option(project.name, project.id));
    editor.add(new Option(project.name, project.id));
  }
  filter.value = previous;
}
