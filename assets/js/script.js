$(document).ready(function () {
  // Retrieve tasks and nextId from localStorage
  let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
  let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;
  const form = $("#taskForm");
  const title = $("#taskTitle");
  const dueDate = $("#taskDueDate");
  const taskDescription = $("#taskDescription");
  const todoCardsDiv = $("#todo-cards");
  const inProgressCardsDiv = $("#in-progress-cards");
  const doneCardsDiv = $("#done-cards");

  function generateTaskId() {
    return nextId++;
  }

  const datePicker = dueDate.flatpickr({
    dateFormat: "Y-m-d",
    allowInput: true,
    onClose: function (selectedDates, dateStr, instance) {
      instance.setDate(dateStr, true);
    },
  });

  dueDate.on("click", function () {
    datePicker.open();
  });

  function renderTasks() {
    todoCardsDiv.html("");
    inProgressCardsDiv.html("");
    doneCardsDiv.html("");

    taskList.forEach(function (task) {
      const html = `
        <div class="card w-75 task-card draggable my-3 ${getCardColor(
          task.status
        )} ui-draggable ui-draggable-handle" data-task-id="${task.id}">
          <div class="card-header h4">${task.title}</div>
          <div class="card-body">
            <p class="card-text">${task.description}</p>
            <p class="card-text">${task.dueDate}</p>
            <button class="btn btn-danger delete border-light" data-task-id="${
              task.id
            }">Delete</button>
          </div>
          </div>`;

      if (task.status === "to-do") {
        todoCardsDiv.append(html);
      } else if (task.status === "in-progress") {
        inProgressCardsDiv.append(html);
      } else if (task.status === "done") {
        doneCardsDiv.append(html);
      }
    });

    makeCardsDraggable();
  }

  function getCardColor(status) {
    if (status === "done") {
      return "bg-light text-dark";
    } else {
      return "bg-danger text-white";
    }
  }

  function makeCardsDraggable() {
    const taskCards = $(".draggable");
    taskCards.each(function () {
      $(this).attr("draggable", true);
      $(this).on("dragstart", handleDragStart);
    });
  }

  function handleDragStart(event) {
    event.originalEvent.dataTransfer.setData(
      "text/plain",
      $(event.target).data("task-id")
    );
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(event, status) {
    event.preventDefault();
    const taskId = event.originalEvent.dataTransfer.getData("text/plain");
    const taskIndex = taskList.findIndex(function (task) {
      return task.id == taskId;
    });

    taskList[taskIndex].status = status;

    localStorage.setItem("tasks", JSON.stringify(taskList));

    renderTasks();
  }

  form.on("submit", function (e) {
    e.preventDefault();

    const newTask = {
      id: generateTaskId(),
      title: title.val(),
      description: taskDescription.val(),
      dueDate: dueDate.val(),
      status: "to-do",
    };

    taskList.push(newTask);

    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", nextId);

    renderTasks();

    title.val("");
    taskDescription.val("");
    dueDate.val("");
  });

  $(document).on("click", ".delete", function (event) {
    const taskId = $(event.target).data("task-id");

    taskList = taskList.filter(function (task) {
      return task.id != taskId;
    });

    localStorage.setItem("tasks", JSON.stringify(taskList));

    renderTasks();
  });

  const inProgressLane = $("#in-progress");
  const doneLane = $("#done");
  const TODOLane = $("#to-do");

  inProgressLane.on("dragover", handleDragOver);
  inProgressLane.on("drop", function (event) {
    handleDrop(event, "in-progress");
  });

  doneLane.on("dragover", handleDragOver);
  doneLane.on("drop", function (event) {
    handleDrop(event, "done");
  });

  TODOLane.on("dragover", handleDragOver);
  TODOLane.on("drop", function (event) {
    handleDrop(event, "to-do");
  });

  renderTasks();
});
