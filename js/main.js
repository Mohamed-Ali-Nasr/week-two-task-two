let tasks = [];
let taskInput = document.getElementById("task-input");

//* get tasks from local storage if exists when page loads *//
document.addEventListener("DOMContentLoaded", () => {
  taskInput.focus();
  if (localStorage.getItem("tasks")) {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    updateTasksList();
    updateProgress();
  }
});

//* save tasks to local storage *//
const saveTasks = () => localStorage.setItem("tasks", JSON.stringify(tasks));

//* add task *//
const addTask = () => {
  const task = taskInput.value.trim();

  if (task && !checkInput(task)) {
    tasks.push({
      text: task,
      completed: false,
    });

    taskInput.value = "";
    updateTasksList();
    updateProgress();
    saveTasks();
    notification("Task Added Successfully", "add");
  }
};

//* update task *//
const updateTasksList = () => {
  const tasksList = document.getElementById("tasks-list");
  tasksList.innerHTML = "";

  tasks.forEach((task, index) => {
    const taskItem = document.createElement("li");
    taskItem.innerHTML = `
    <div class="task-item">
      <div class="task ${task.completed ? "completed" : ""}">
        <input onchange="toggleTaskComplete(${index})" type="checkbox" class="checkbox" ${
      task.completed ? "checked" : ""
    } aria-label="Check-Box" />
        <p>${task.text}</p>
        <input type="text" />
      </div>
      
      <div class="icon">
       <img src="img/edit.png" alt="edit" onclick="editTask(this, ${index})" />
       <img src="img/bin.png" alt="bin" onclick="deleteTask(${index})" />
      </div>
    </div>
    `;

    tasksList.appendChild(taskItem);
  });
};

//* toggle task complete *//
const toggleTaskComplete = (index) => {
  tasks[index].completed = !tasks[index].completed;

  updateTasksList();
  updateProgress();
  saveTasks();
};

//* edit task *//
const editTask = function (button, index) {
  const taskItem = button.parentNode.parentNode;
  const editInput = taskItem.querySelector(".task input[type='text']");
  const editText = taskItem.querySelector(".task p");
  const containsClass = taskItem.classList.contains("edit-mode");

  if (tasks[index].completed) {
    tasks[index].completed = false;
    taskItem.querySelector(".task").classList.remove("completed");
    taskItem.querySelector(".task input[type='checkbox']").checked = false;
    updateProgress();
    saveTasks();
  }

  if (containsClass) {
    if (!checkInput(editInput.value) && editInput.value.trim()) {
      editText.innerText = editInput.value;
      notification("Task Updated Successfully", "warning");
    } else {
      editInput.value = editText.innerText;
    }
  } else {
    editInput.value = editText.innerText;
  }

  tasks[index].text = editInput.value;
  taskItem.classList.toggle("edit-mode");

  updateProgress();
  saveTasks();
};

//* delete task *//
const deleteTask = (index) => {
  tasks.splice(index, 1);
  updateTasksList();
  updateProgress();
  saveTasks();
  notification("Task Deleted Successfully", "delete");
};

//* update progress *//
const updateProgress = () => {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;
  const progress = (completedTasks / totalTasks) * 100;

  document.getElementById("progress").style.width = `${progress}%`;

  document.getElementById(
    "numbers"
  ).textContent = `${completedTasks} / ${totalTasks}`;
};

document.getElementById("add-task").addEventListener("click", (e) => {
  e.preventDefault();
  addTask();
});

//* Check If the Task is already Exist *//
const checkInput = (inputValue) => {
  let status = false;

  if (localStorage.getItem("tasks")) {
    const currentTasks = JSON.parse(localStorage.getItem("tasks"));

    currentTasks.forEach((task) => {
      if (inputValue.toLowerCase() === task.text.toLowerCase()) {
        notification("This Task Is Already Exist", "warning");
        status = true;
      }
    });
  }

  return status;
};

//* notification *//
function notification(title, type) {
  let obj = {};
  obj.progress = 0;
  obj.fadeTime = 1000;
  obj.fadeTicks = 50;
  obj.fadeInterval = 0;
  obj.opacity = 1;
  obj.time = 2;
  obj.ticks = 500;
  obj.element = null;
  obj.progress = null;
  obj.progressPos = 0;
  obj.progressIncrement = 0;

  obj.Show = function () {
    const notifyContainer = document.getElementById("notifications");
    obj.element = document.createElement("div");
    obj.element.className = `notification ${type}`;
    obj.element.innerHTML = `
      <div class="content">
       <h1>${title}</h1>
      </div>

      <div class="progressDiv">
       <div></div>
      </div>
    `;

    notifyContainer.appendChild(obj.element);
    obj.progress = document.querySelector(".progressDiv > div");
    obj.progressIncrement = 100 / obj.ticks;
    obj.StartWait();
  };

  obj.StartWait = function () {
    if (obj.progressPos >= 100) {
      obj.fadeInterval = 1;
      obj.FadeTick();
      return;
    }
    setTimeout(obj.Tick, obj.time);
  };

  obj.Clear = function () {
    obj.opacity = 0;
    obj.progressPos = 100;
    obj.element.remove();
    obj = null;
    return;
  };

  obj.FadeTick = function () {
    obj.opacity = (obj.opacity * 100 - obj.fadeInterval) / 100;
    if (obj.opacity <= 0) {
      obj.element.remove();
      obj = null;
      return;
    }
    obj.element.style.opacity = obj.opacity;
    setTimeout(obj.FadeTick, obj.fadeTime / obj.fadeTicks);
  };

  obj.Tick = function () {
    obj.progressPos += obj.progressIncrement;
    obj.progress.style.width = obj.progressPos + "%";
    obj.StartWait();
  };
  obj.Show();
  return obj;
}
