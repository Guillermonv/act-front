import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";

const UPDATE_API_URL = "http://localhost:8080/activities/update";

const statusLevels = [
  { value: 0.15, label: "Suck", color: "#000000" },
  { value: 0.35, label: "Failed", color: "#FF0000" },
  { value: 0.55, label: "Regular", color: "#FFFF00" },
  { value: 0.75, label: "Accomplished", color: "#00A100" },
  { value: 0.95, label: "Excellence", color: "#0000FF" },
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
        refreshData(); // 🔁 volver a cargar los datos del heatmap
      })
      .catch((err) => console.error("Error updating:", err));

    setSelectedCell(null);
  };

  return (
    <Modal open={!!selectedCell} onClose={() => setSelectedCell(null)}>
      <Box
        sx={{
          p: 7,
          bgcolor: "#FFFFFF",
          borderRadius: 2,
          boxShadow: 0,
          width: "90vw",
          maxWidth: 650,
          maxHeight: 750,
          margin: "auto",
          mt: 18,
          display: "flex",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.3rem" }}>
            <strong>Date:</strong> {formatDate(selectedCell.x)}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.3rem" }}>
            <strong>Activity:</strong> {selectedCell.activity}
          </Typography>
        </Box>

        <Slider
          value={currentValue}
          step={0.01}
          marks={statusLevels.map(({ value, label, color }) => ({
            value,
            label: (
              <span style={{ color: "#000000", fontSize: "1.2rem", fontWeight: "bold" }}>
                {label}
              </span>
            ),
          }))}
          min={0.15}
          max={0.95}
          onChange={handleStatusChange}
          sx={{
            color: getClosestStatus(currentValue).color,
            '& .MuiSlider-markLabel': {
              fontSize: "1.2rem",
              fontWeight: "bold",
              textAlign: "center",
              whiteSpace: "nowrap",
              transform: "translateX(-50%)",
            },
          }}
        />

        <br /><br />
        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="contained"
          color="success"
          onClick={handleSave}
          sx={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            py: 1.5,
            mt: "auto",
          }}
        >
          Save
        </Button>
      </Box>
    </Modal>
  );
};

export default StatusModal;
