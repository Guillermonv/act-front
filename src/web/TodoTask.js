import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  Switch,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

const API_URL = "http://localhost:8080/tasks"; // mock API

const STATUS_ORDER = ["open", "blocked", "in_progress", "done"];
const STATUS_LABEL = {
  open: "Open",
  blocked: "Blocked",
  in_progress: "In Progress",
  done: "Done",
};
const STATUS_COLOR = {
  open: "#ffffff",
  in_progress: "#fff9c4",
  blocked: "#ffcdd2",
  done: "#c8e6c9",
};

function normalizeStatus(raw) {
  if (!raw) return "open";
  const r = raw.toLowerCase();
  if (r === "completed" || r === "done") return "done";
  if (r === "in_progress" || r === "in progress") return "in_progress";
  if (r === "block" || r === "blocked") return "blocked";
  if (r === "open") return "open";
  return r;
}

function TodoTask() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [showBoard, setShowBoard] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    message: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    let mounted = true;
    fetch(API_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        const normalized = data.map((t) => ({
          ...t,
          status: normalizeStatus(t.status),
        }));
        setTasks(normalized);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
    return () => (mounted = false);
  }, []);

  function onDragStart(e, id) {
    e.dataTransfer.setData("text/plain", String(id));
    setDraggingId(id);
  }

  function onDragEnd() {
    setDraggingId(null);
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  async function onDrop(e, newStatus) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    setDraggingId(null);

    const taskToUpdate = tasks.find((t) => String(t.id) === String(id));
    if (!taskToUpdate) return;

    const updatedTask = { ...taskToUpdate, status: newStatus };

    setTasks((prev) =>
      prev.map((t) => (String(t.id) === String(id) ? updatedTask : t))
    );

    try {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });
      console.log("✅ Task updated:", updatedTask);
    } catch (err) {
      console.error("❌ Error updating task:", err);
    }
  }

  function tasksByStatus(status) {
    return tasks.filter((t) => t.status === status);
  }

  function handleOpenModal() {
    setNewTask({ title: "", message: "", startDate: "", endDate: "" });
    setOpenModal(true);
  }

  function handleCloseModal() {
    setOpenModal(false);
  }

  async function handleAddTask() {
    const payload = {
      ...newTask,
      status: "open",
      id: tasks.length + 1,
    };

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setTasks((prev) => [...prev, payload]);
      setOpenModal(false);
    } catch (err) {
      console.error("Error adding task:", err);
    }
  }

  async function handleDeleteTask(id) {
    if (!window.confirm("¿Seguro que quieres eliminar esta tarea?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("No se pudo eliminar la tarea");
        return;
      }
      setTasks((prev) => prev.filter((t) => String(t.id) !== String(id)));
      console.log("🗑️ Task deleted:", id);
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  }

  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "center",
        marginTop: "1.5rem",
        fontFamily: "Roboto, sans-serif",
        minHeight: "100vh",
        padding: "20px",
      },
    },
    React.createElement(
      "div",
      {
        style: {
          width: "55%",
          padding: "1rem",
          backgroundColor: "white",
          borderRadius: "1rem",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          marginBottom: 0,
          transition: "all 0.4s ease",
        },
      },
      // 🔘 Toggle y botón "Add Task"
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          },
        },
        React.createElement(FormControlLabel, {
          control: React.createElement(Switch, {
            checked: showBoard,
            onChange: () => setShowBoard(!showBoard),
            color: "primary",
          }),
          label: showBoard ? "Hide Board" : "Show Board",
        }),
        React.createElement(
          Button,
          {
            variant: "contained",
            color: "primary",
            onClick: handleOpenModal,
            style: {
              borderRadius: "20px",
              padding: "1px 2px",
              fontWeight: "600",
              textTransform: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            },
          },
          "+"
        )
      ),

      showBoard &&
        React.createElement(
          React.Fragment,
          null,
          React.createElement(
            "header",
            {
              style: {
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              },
            },
          ),

          loading
            ? React.createElement(
                "div",
                { style: { textAlign: "center", padding: "50px", color: "#555" } },
                "Cargando tareas..."
              )
            : error
            ? React.createElement(
                "div",
                { style: { textAlign: "center", padding: "50px", color: "red" } },
                "Error: ",
                error
              )
            : React.createElement(
                "div",
                { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" } },
                STATUS_ORDER.map((statusKey) =>
                  React.createElement(
                    "div",
                    {
                      key: statusKey,
                      onDragOver: allowDrop,
                      onDrop: (e) => onDrop(e, statusKey),
                      style: {
                        backgroundColor: STATUS_COLOR[statusKey],
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "12px",
                        display: "flex",
                        flexDirection: "column",
                        maxHeight: "70vh",
                      },
                    },
                    React.createElement(
                      "div",
                      {
                        style: {
                          marginBottom: "8px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        },
                      },
                      React.createElement("h2", { style: { fontSize: "14px", fontWeight: "600" } }, STATUS_LABEL[statusKey]),
                      React.createElement("span", { style: { fontSize: "12px", color: "#777" } }, tasksByStatus(statusKey).length)
                    ),
                    React.createElement(
                      "div",
                      { style: { overflowY: "auto", flex: 1, paddingRight: "4px" } },
                      tasksByStatus(statusKey).length === 0
                        ? React.createElement("div", { style: { fontSize: "12px", color: "#aaa", textAlign: "center" } }, "No tasks")
                        : tasksByStatus(statusKey).map((task) =>
                            React.createElement(
                              "div",
                              {
                                key: task.id,
                                draggable: true,
                                onDragStart: (e) => onDragStart(e, task.id),
                                onDragEnd: onDragEnd,
                                style: {
                                  backgroundColor: draggingId === task.id ? "#f0f0f0" : "#ffffff",
                                  opacity: draggingId === task.id ? 0.6 : 1,
                                  border: "1px solid #ddd",
                                  borderRadius: "6px",
                                  padding: "10px",
                                  marginBottom: "8px",
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                  cursor: "grab",
                                },
                              },
                              React.createElement(
                                "div",
                                { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                                React.createElement("h3", { style: { fontSize: "14px", fontWeight: "bold" } }, task.title),
                                React.createElement("div", { style: { fontSize: "12px", color: "#999" } }, "#", task.id)
                              ),
                              React.createElement("p", { style: { fontSize: "12px", color: "#666", marginTop: "4px" } }, task.message),
                              React.createElement(
                                "div",
                                { style: { fontSize: "11px", color: "#777", marginTop: "6px" } },
                                React.createElement("div", null, React.createElement("strong", null, "Start:"), " ", task.startDate || "-"),
                                React.createElement("div", null, React.createElement("strong", null, "End:"), " ", task.endDate || "-"),
                                React.createElement("div", null, React.createElement("strong", null, "Status:"), " ", String(task.status))
                              ),
                              React.createElement(
                                "div",
                                { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" } },
                                React.createElement("div", { style: { fontSize: "11px", color: "#777" } }, "Detalle completo"),
                                React.createElement(
                                  "div",
                                  { style: { display: "flex", gap: "6px", alignItems: "center" } },
                                  React.createElement(
                                    "button",
                                    {
                                      onClick: () => alert(JSON.stringify(task, null, 2)),
                                      style: { border: "1px solid #ccc", borderRadius: "4px", padding: "2px 6px", fontSize: "12px", cursor: "pointer" },
                                    },
                                    "Ver"
                                  ),
                                  React.createElement(
                                    "button",
                                    {
                                      onClick: () => handleDeleteTask(task.id),
                                      style: { border: "none", background: "none", color: "#d32f2f", cursor: "pointer", fontSize: "16px" },
                                    },
                                    "🗑️"
                                  )
                                )
                              )
                            )
                          )
                    )
                  )
                )
              )
        ),

      // 🟢 Modal para agregar nueva tarea
      React.createElement(
        Dialog,
        { open: openModal, onClose: handleCloseModal },
        React.createElement(DialogTitle, null, "Agregar nueva tarea"),
        React.createElement(
          DialogContent,
          null,
          React.createElement(TextField, {
            label: "Título",
            fullWidth: true,
            margin: "dense",
            value: newTask.title,
            onChange: (e) => setNewTask({ ...newTask, title: e.target.value }),
          }),
          React.createElement(TextField, {
            label: "Mensaje",
            fullWidth: true,
            margin: "dense",
            multiline: true,
            value: newTask.message,
            onChange: (e) => setNewTask({ ...newTask, message: e.target.value }),
          }),
          React.createElement(TextField, {
            label: "Fecha de inicio",
            type: "date",
            fullWidth: true,
            margin: "dense",
            InputLabelProps: { shrink: true },
            value: newTask.startDate,
            onChange: (e) => setNewTask({ ...newTask, startDate: e.target.value }),
          }),
          React.createElement(TextField, {
            label: "Fecha de fin",
            type: "date",
            fullWidth: true,
            margin: "dense",
            InputLabelProps: { shrink: true },
            value: newTask.endDate,
            onChange: (e) => setNewTask({ ...newTask, endDate: e.target.value }),
          })
        ),
        React.createElement(
          DialogActions,
          null,
          React.createElement(Button, { onClick: handleCloseModal }, "Cancelar"),
          React.createElement(Button, { onClick: handleAddTask, variant: "contained", color: "primary" }, "Agregar")
        )
      )
    )
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(TodoTask));

export default TodoTask;
