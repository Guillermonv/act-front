import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";

const UPDATE_API_URL = "http://44.204.238.86:80/activities/update";

const statusLevels = [
  { value: 0.15, label: "suck", color: "#000000" },
  { value: 0.35, label: "failed", color: "#FF0000" },
  { value: 0.55, label: "regular", color: "#FFFF00" },
  { value: 0.75, label: "accomplished", color: "#00A100" },
  { value: 0.95, label: "excellence", color: "#0000FF" },
];

const getClosestStatus = (value) => {
  return statusLevels.reduce((prev, curr) =>
    Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev
  );
};

const formatDate = (isoDate) => {
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
};

// ... mismo imports y funciones ...

const StatusModal = ({ selectedCell, setSelectedCell, refreshData }) => {
  if (!selectedCell) return null;

  const currentValue = statusLevels.find((s) => s.label === selectedCell.status)?.value || 0.55;

  const handleStatusChange = (_, newValue) => {
    const closestStatus = getClosestStatus(newValue);
    setSelectedCell((prev) => ({ ...prev, status: closestStatus.label }));
  };

  const handleSave = () => {
    const closestStatus = getClosestStatus(currentValue);
    const formattedDate = formatDate(selectedCell.x);

    fetch(UPDATE_API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: formattedDate,
        activity: selectedCell.activity,
        status: closestStatus.label,
      }),
    })
      .then(() => {
        console.log("Updated successfully");
        refreshData();
      })
      .catch((err) => console.error("Error updating:", err));

    setSelectedCell(null);
  };

  const closestStatus = getClosestStatus(currentValue);

  return (
    <Modal open={!!selectedCell} onClose={() => setSelectedCell(null)}>
      <Box
        sx={{
          p: 2,
          bgcolor: "#FFFFFF",
          borderRadius: 1,
          boxShadow: 10,
          maxWidth: 450,
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
          mt: 18,
        }}
      >
        {/* Slider */}
        <Slider
          value={currentValue}
          step={0.01}
          min={0.15}
          max={0.95}
          onChange={handleStatusChange}
          sx={{
            mt: 0,
            mb: 1,
            color: getClosestStatus(currentValue).color,
          }}
        />

        {/* Fila inferior con Date + Activity, status label y botón */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          {/* div1 - Fecha y actividad */}
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Typography variant="body2" sx={{ fontSize: "0.95rem", color: "#000" }}>
              <strong>Date:</strong> {formatDate(selectedCell.x)}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.95rem", color: "#000" }}>
              <strong>Activity:</strong> {selectedCell.activity}
            </Typography>
          </Box>

          {/* div2 - Texto dinámico */}
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography
              variant="body2"
              sx={{
                fontSize: "1rem",
                fontWeight: "bold",
                color: "#000",
              }}
            >
              {closestStatus.label}
            </Typography>
          </Box>

          {/* div3 - Botón */}
          <Box sx={{ flex: 1, textAlign: "right" }}>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                fontSize: "0.9rem",
                fontWeight: "bold",
                px: 2,
                py: 0.5,
                textTransform: "none",
                bgcolor: "#000",
                '&:hover': { bgcolor: "#222" },
              }}
            >
              Save
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default StatusModal;

