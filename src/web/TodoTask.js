import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

const STATUS_ORDER = ["open", "blocked", "in_progress", "done"];
const STATUS_LABEL = {
  open: "Open",
  blocked: "Blocked",
  in_progress: "In Progress",
  done: "Done",
};
const STATUS_COLOR = {
  open: "#ffffff",
  in_progress: "#fff9c4", // amarillo
  blocked: "#ffcdd2", // rojo claro
  done: "#c8e6c9", // verde claro
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

  useEffect(() => {
    let mounted = true;
    fetch("https://testtask.free.beeceptor.com/todo")
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

  function onDrop(e, newStatus) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    setTasks((prev) =>
      prev.map((t) => (String(t.id) === String(id) ? { ...t, status: newStatus } : t))
    );
    setDraggingId(null);
  }

  function tasksByStatus(status) {
    return tasks.filter((t) => t.status === status);
  }

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", padding: "20px", display: "flex", justifyContent: "center" }}>
      <div style={{ maxWidth: "1200px", width: "100%" }}>
        <header style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Kanban Board</h1>
          <div style={{ fontSize: "14px", color: "#555" }}>Drag tasks horizontally between columns</div>
        </header>
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px", color: "#555" }}>Cargando tareas...</div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "50px", color: "red" }}>Error: {error}</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            {STATUS_ORDER.map((statusKey) => (
              <div
                key={statusKey}
                onDragOver={allowDrop}
                onDrop={(e) => onDrop(e, statusKey)}
                style={{ backgroundColor: STATUS_COLOR[statusKey], border: "1px solid #ddd", borderRadius: "8px", padding: "12px", display: "flex", flexDirection: "column", maxHeight: "70vh" }}
              >
                <div style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 style={{ fontSize: "14px", fontWeight: "600" }}>{STATUS_LABEL[statusKey]}</h2>
                  <span style={{ fontSize: "12px", color: "#777" }}>{tasksByStatus(statusKey).length}</span>
                </div>
                <div style={{ overflowY: "auto", flex: 1, paddingRight: "4px" }}>
                  {tasksByStatus(statusKey).length === 0 ? (
                    <div style={{ fontSize: "12px", color: "#aaa", textAlign: "center" }}>No tasks</div>
                  ) : (
                    tasksByStatus(statusKey).map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, task.id)}
                        onDragEnd={onDragEnd}
                        style={{
                          backgroundColor: draggingId === task.id ? "#f0f0f0" : "#ffffff",
                          opacity: draggingId === task.id ? 0.6 : 1,
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          padding: "10px",
                          marginBottom: "8px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                          cursor: "grab",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <h3 style={{ fontSize: "14px", fontWeight: "bold" }}>{task.title}</h3>
                          <div style={{ fontSize: "12px", color: "#999" }}>#{task.id}</div>
                        </div>
                        <p style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>{task.message}</p>
                        <div style={{ fontSize: "11px", color: "#777", marginTop: "6px" }}>
                          <div><strong>Start:</strong> {task.startDate || '-'}</div>
                          <div><strong>End:</strong> {task.endDate || '-'}</div>
                          <div><strong>Status:</strong> {String(task.status)}</div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                          <div style={{ fontSize: "11px", color: "#777" }}>Detalle completo</div>
                          <button onClick={() => alert(JSON.stringify(task, null, 2))} style={{ border: "1px solid #ccc", borderRadius: "4px", padding: "2px 6px", fontSize: "12px", cursor: "pointer" }}>Ver</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<TodoTask />);

export default TodoTask;