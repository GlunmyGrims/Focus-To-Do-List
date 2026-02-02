// =========================
// STATE
// =========================

const initialState = [
  {
    title: "My first objective",
    tasks: [],
  },
];

let state = loadState() || initialState;

// =========================
// ROOT
// =========================

const app = document.querySelector(".app");

// =========================
// TEMPLATES
// =========================

const objectiveTemplate = (objective, oIndex) => `
<section class="task-list" data-objective="${oIndex}">
  <header class="task-list__header">
    <h2 class="task-list__title" contenteditable="true">
      ${objective.title}
    </h2>

    <div class="progress progress--global">
      <div class="progress__bar"></div>
    </div>

    <button class="objective__delete">
      <i class="bi bi-trash"></i>
    </button>
  </header>

  <ul class="task-list__items">
    ${objective.tasks
      .map((task, tIndex) => taskTemplate(task, oIndex, tIndex))
      .join("")}
  </ul>

  <button class="task-list__add-btn-1">
    <i class="bi bi-plus-lg"></i> Add task
  </button>

  <footer class="task-list__footer">
    <span class="progress__percentage">0%</span>
  </footer>
</section>
`;

const taskTemplate = (task, oIndex, tIndex) => `
<li class="task
  ${task.completed ? "task--completed" : ""}
  ${task.active ? "task--active" : ""}"
  data-task="${tIndex}">

  <div class="task__main">
    <button class="task__toggle">
      <i class="bi ${
        task.expanded ? "bi-caret-down-fill" : "bi-caret-right-fill"
      }"></i>
    </button>

    <button class="task__check">
      <i class="bi bi-square task__icon task__icon--unchecked"></i>
      <i class="bi bi-check-square-fill task__icon task__icon--checked"></i>
    </button>

    <span class="task__title" contenteditable="true">
      ${task.title}
    </span>

    <button class="task__delete">
      <i class="bi bi-trash"></i>
    </button>
  </div>

  <ul class="subtask-list ${task.expanded ? "subtask-list--expanded" : ""}">
    ${task.subtasks
      .map((st, sIndex) => subtaskTemplate(st, oIndex, tIndex, sIndex))
      .join("")}

    <li class="subtask-list__add">
      <button class="subtask-list__add-btn">
        <i class="bi bi-plus-lg"></i> Add subtask
      </button>
    </li>
  </ul>
</li>
`;

const subtaskTemplate = (subtask, oIndex, tIndex, sIndex) => `
<li class="subtask ${subtask.completed ? "subtask--completed" : ""}"
    data-subtask="${sIndex}">
  <button class="subtask__check">
    <i class="bi bi-square subtask__icon subtask__icon--unchecked"></i>
    <i class="bi bi-check-square-fill subtask__icon subtask__icon--checked"></i>
  </button>

  <span class="subtask__title" contenteditable="true">
    ${subtask.title}
  </span>

  <button class="subtask__delete">
    <i class="bi bi-x-lg"></i>
  </button>
</li>
`;

// =========================
// RENDER
// =========================

function render() {
  app.innerHTML = "";
  state.forEach((objective, index) => {
    app.insertAdjacentHTML("beforeend", objectiveTemplate(objective, index));
  });
  updateProgress();
}

// =========================
// PROGRESS
// =========================

function updateProgress() {
  document.querySelectorAll(".task-list").forEach((list, oIndex) => {
    let total = 0;
    let completed = 0;

    state[oIndex].tasks.forEach((task) => {
      if (task.subtasks.length) {
        task.subtasks.forEach((st) => {
          total++;
          if (st.completed) completed++;
        });
      } else {
        total++;
        if (task.completed) completed++;
      }
    });

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    list.querySelector(".progress__bar").style.width = `${percent}%`;
    list.querySelector(".progress__percentage").textContent = `${percent}%`;
  });
}

// =========================
// EVENTS (DELEGATION)
// =========================

document.addEventListener("click", (e) => {
  if (
    e.target.closest(".task-list__title") ||
    e.target.closest(".task__title") ||
    e.target.closest(".subtask__title")
  ) {
    return;
  }

  if (e.target.closest(".task-list__add-btn-2")) {
    state.push({ title: "New objective", tasks: [] });
    saveState();
    render();
  }

  const delObj = e.target.closest(".objective__delete");
  if (delObj && confirm("Delete this objective?")) {
    const oIndex = delObj.closest(".task-list").dataset.objective;
    state.splice(oIndex, 1);
    saveState();
    render();
  }

  const addTask = e.target.closest(".task-list__add-btn-1");
  if (addTask) {
    const oIndex = addTask.closest(".task-list").dataset.objective;
    state[oIndex].tasks.push({
      title: "New task",
      completed: false,
      expanded: false,
      active: false,
      subtasks: [],
    });
    saveState();
    render();
  }

  const delTask = e.target.closest(".task__delete");
  if (delTask && confirm("Delete this task?")) {
    const list = delTask.closest(".task-list");
    const task = delTask.closest(".task");

    const oIndex = list.dataset.objective;
    const tIndex = task.dataset.task;

    state[oIndex].tasks.splice(tIndex, 1);
    saveState();
    render();
  }

  const toggle = e.target.closest(".task__toggle");
  if (toggle) {
    const list = toggle.closest(".task-list");
    const task = toggle.closest(".task");

    const oIndex = list.dataset.objective;
    const tIndex = task.dataset.task;

    state[oIndex].tasks[tIndex].expanded =
      !state[oIndex].tasks[tIndex].expanded;

    saveState();
    render();
  }

  const taskMain = e.target.closest(".task__main");
  if (taskMain) {
    const list = taskMain.closest(".task-list");
    const task = taskMain.closest(".task");

    const oIndex = list.dataset.objective;
    const tIndex = task.dataset.task;

    state[oIndex].tasks.forEach((t) => (t.active = false));
    state[oIndex].tasks[tIndex].active = true;

    saveState();
    render();
  }

  const taskCheck = e.target.closest(".task__check");
  if (taskCheck) {
    const list = taskCheck.closest(".task-list");
    const task = taskCheck.closest(".task");

    const oIndex = list.dataset.objective;
    const tIndex = task.dataset.task;

    state[oIndex].tasks[tIndex].completed =
      !state[oIndex].tasks[tIndex].completed;

    saveState();
    render();
  }

  const addSub = e.target.closest(".subtask-list__add-btn");
  if (addSub) {
    const list = addSub.closest(".task-list");
    const task = addSub.closest(".task");

    const oIndex = list.dataset.objective;
    const tIndex = task.dataset.task;

    state[oIndex].tasks[tIndex].expanded = true;
    state[oIndex].tasks[tIndex].subtasks.push({
      title: "New subtask",
      completed: false,
    });

    saveState();
    render();
  }

  const delSub = e.target.closest(".subtask__delete");
  if (delSub) {
    const list = delSub.closest(".task-list");
    const task = delSub.closest(".task");
    const sub = delSub.closest(".subtask");

    const oIndex = list.dataset.objective;
    const tIndex = task.dataset.task;
    const sIndex = sub.dataset.subtask;

    state[oIndex].tasks[tIndex].subtasks.splice(sIndex, 1);
    saveState();
    render();
  }

  const subCheck = e.target.closest(".subtask__check");
  if (subCheck) {
    const list = subCheck.closest(".task-list");
    const task = subCheck.closest(".task");
    const sub = subCheck.closest(".subtask");

    const oIndex = list.dataset.objective;
    const tIndex = task.dataset.task;
    const sIndex = sub.dataset.subtask;

    state[oIndex].tasks[tIndex].subtasks[sIndex].completed =
      !state[oIndex].tasks[tIndex].subtasks[sIndex].completed;

    saveState();
    render();
  }
});

// =========================
// EDITABLE CONTENT
// =========================

document.addEventListener(
  "blur",
  (e) => {
    const objTitle = e.target.closest(".task-list__title");
    if (objTitle) {
      const list = objTitle.closest(".task-list");
      const oIndex = list.dataset.objective;

      state[oIndex].title = objTitle.textContent.trim() || "Untitled";
      saveState();
    }

    const taskTitle = e.target.closest(".task__title");
    if (taskTitle) {
      const list = taskTitle.closest(".task-list");
      const task = taskTitle.closest(".task");

      const oIndex = list.dataset.objective;
      const tIndex = task.dataset.task;

      state[oIndex].tasks[tIndex].title =
        taskTitle.textContent.trim() || "Untitled";
      saveState();
    }

    const subTitle = e.target.closest(".subtask__title");
    if (subTitle) {
      const list = subTitle.closest(".task-list");
      const task = subTitle.closest(".task");
      const sub = subTitle.closest(".subtask");

      const oIndex = list.dataset.objective;
      const tIndex = task.dataset.task;
      const sIndex = sub.dataset.subtask;

      state[oIndex].tasks[tIndex].subtasks[sIndex].title =
        subTitle.textContent.trim() || "Untitled";
      saveState();
    }
  },
  true,
);

// =========================
// STORAGE
// =========================

function saveState() {
  localStorage.setItem("focusTodo", JSON.stringify(state));
}

function loadState() {
  return JSON.parse(localStorage.getItem("focusTodo"));
}

// =========================
// THEME TOGGLE
// =========================

const themeToggleBtn = document.querySelector(".theme-toggle");
const THEME_KEY = "focusTodoTheme";

const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme === "night") {
  document.body.classList.add("theme--night");
}

themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("theme--night");

  const isNight = document.body.classList.contains("theme--night");
  localStorage.setItem(THEME_KEY, isNight ? "night" : "light");
});

// =========================
// INIT
// =========================

render();
