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

const API_URL = "https://testtask.free.beeceptor.com/todo"; // mock API

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

  // 🔹 Modal y nuevo task
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

  // 🔹 PUT con objeto completo al cambiar de columna
  async function onDrop(e, newStatus) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    setDraggingId(null);

    // Buscar la tarea correspondiente
    const taskToUpdate = tasks.find((t) => String(t.id) === String(id));
    if (!taskToUpdate) return;

    // Crear el objeto actualizado
    const updatedTask = { ...taskToUpdate, status: newStatus };

    // Actualizar localmente
    setTasks((prev) =>
      prev.map((t) => (String(t.id) === String(id) ? updatedTask : t))
    );

    // 🔹 PUT completo al backend
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

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        minHeight: "100vh",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: "1200px", width: "100%" }}>
        {/* 🔘 Toggle y botón "Add Task" */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <FormControlLabel
            control={
              <Switch
                checked={showBoard}
                onChange={() => setShowBoard(!showBoard)}
                color="primary"
              />
            }
            label={showBoard ? "Hide Board" : "Show Board"}
          />

          {/* 🌟 Botón elegante para agregar tarea */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenModal}
            style={{
              borderRadius: "20px",
              padding: "8px 18px",
              fontWeight: "600",
              textTransform: "none",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            + Add Task
          </Button>
        </div>

        {showBoard && (
          <>
            <header
              style={{
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Kanban Board</h1>
              <div style={{ fontSize: "14px", color: "#555" }}>
                Drag tasks horizontally between columns
              </div>
            </header>

            {loading ? (
              <div style={{ textAlign: "center", padding: "50px", color: "#555" }}>
                Cargando tareas...
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
                Error: {error}
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "16px",
                }}
              >
                {STATUS_ORDER.map((statusKey) => (
                  <div
                    key={statusKey}
                    onDragOver={allowDrop}
                    onDrop={(e) => onDrop(e, statusKey)}
                    style={{
                      backgroundColor: STATUS_COLOR[statusKey],
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "12px",
                      display: "flex",
                      flexDirection: "column",
                      maxHeight: "70vh",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h2 style={{ fontSize: "14px", fontWeight: "600" }}>
                        {STATUS_LABEL[statusKey]}
                      </h2>
                      <span style={{ fontSize: "12px", color: "#777" }}>
                        {tasksByStatus(statusKey).length}
                      </span>
                    </div>

                    <div style={{ overflowY: "auto", flex: 1, paddingRight: "4px" }}>
                      {tasksByStatus(statusKey).length === 0 ? (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "#aaa",
                            textAlign: "center",
                          }}
                        >
                          No tasks
                        </div>
                      ) : (
                        tasksByStatus(statusKey).map((task) => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, task.id)}
                            onDragEnd={onDragEnd}
                            style={{
                              backgroundColor:
                                draggingId === task.id ? "#f0f0f0" : "#ffffff",
                              opacity: draggingId === task.id ? 0.6 : 1,
                              border: "1px solid #ddd",
                              borderRadius: "6px",
                              padding: "10px",
                              marginBottom: "8px",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                              cursor: "grab",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <h3 style={{ fontSize: "14px", fontWeight: "bold" }}>
                                {task.title}
                              </h3>
                              <div style={{ fontSize: "12px", color: "#999" }}>
                                #{task.id}
                              </div>
                            </div>
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#666",
                                marginTop: "4px",
                              }}
                            >
                              {task.message}
                            </p>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "#777",
                                marginTop: "6px",
                              }}
                            >
                              <div>
                                <strong>Start:</strong> {task.startDate || "-"}
                              </div>
                              <div>
                                <strong>End:</strong> {task.endDate || "-"}
                              </div>
                              <div>
                                <strong>Status:</strong> {String(task.status)}
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: "8px",
                              }}
                            >
                              <div style={{ fontSize: "11px", color: "#777" }}>
                                Detalle completo
                              </div>
                              <button
                                onClick={() => alert(JSON.stringify(task, null, 2))}
                                style={{
                                  border: "1px solid #ccc",
                                  borderRadius: "4px",
                                  padding: "2px 6px",
                                  fontSize: "12px",
                                  cursor: "pointer",
                                }}
                              >
                                Ver
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 🟢 Modal para agregar nueva tarea */}
        <Dialog open={openModal} onClose={handleCloseModal}>
          <DialogTitle>Agregar nueva tarea</DialogTitle>
          <DialogContent>
            <TextField
              label="Título"
              fullWidth
              margin="dense"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <TextField
              label="Mensaje"
              fullWidth
              margin="dense"
              multiline
              value={newTask.message}
              onChange={(e) => setNewTask({ ...newTask, message: e.target.value })}
            />
            <TextField
              label="Fecha de inicio"
              type="date"
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              value={newTask.startDate}
              onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
            />
            <TextField
              label="Fecha de fin"
              type="date"
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              value={newTask.endDate}
              onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Cancelar</Button>
            <Button onClick={handleAddTask} variant="contained" color="primary">
              Agregar
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<TodoTask />);

export default TodoTask;
