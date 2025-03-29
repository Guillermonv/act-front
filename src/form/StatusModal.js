import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const UPDATE_API_URL = "https://your-api.com/update";

const statusLevels = [
  { value: 0.15, label: "Suck", color: "#000000" },
  { value: 0.35, label: "Failed", color: "#FF0000" },
  { value: 0.55, label: "Regular", color: "#FFFF00" },
  { value: 0.75, label: "Accomplished", color: "#00A100" },
  { value: 0.95, label: "Excellence\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0", color: "#0000FF" }, // Agrega espacios al final
];


const getColor = (value) => {
  let closest = statusLevels.reduce((prev, curr) =>
    Math.abs(curr.value - value) < Math.abs(prev.value - value) ? curr : prev
  );
  return closest.color;
};

const StatusModal = ({ selectedCell, setSelectedCell }) => {
  if (!selectedCell) return null;

  const handleStatusChange = (_, newValue) => {
    setSelectedCell((prev) => ({ ...prev, status: newValue }));
  };

  const handleSave = () => {
    fetch(UPDATE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedCell.x, activity: selectedCell.activity, status: selectedCell.status })
    }).then(() => console.log("Updated successfully"));
    setSelectedCell(null);
  };

  return (
    <Modal open={!!selectedCell} onClose={() => setSelectedCell(null)}>
      <Box
        sx={{
          p: 5,
          bgcolor: "white",
          borderRadius: 0,
          boxShadow: 0,
          width: "90vw", // Se adapta al tamaño de la pantalla
          maxWidth: 700, // Límite de ancho
          maxHeight: 300, // Límite de ancho
          margin: "auto",
          mt: 10,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <IconButton sx={{ position: "absolute", top: 10, right: 10 }} onClick={() => setSelectedCell(null)}>
          <CloseIcon />
        </IconButton>

        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.3rem", textAlign: "left" }}>
          <strong><b>Activity</b></strong> {selectedCell.activity}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.3rem", textAlign: "left" }}>
          <strong><b>Date:</b></strong> {selectedCell.x}
        </Typography>

        <Slider
  value={selectedCell.status}
  step={0.01}
  marks={statusLevels.map(({ value, label }) => ({ value, label }))}
  min={0.15}
  max={0.95}
  onChange={handleStatusChange}
  sx={{
    color: getColor(selectedCell.status),
    '& .MuiSlider-markLabel': {
      fontSize: "1.2rem",
      fontWeight: "bold",
      textAlign: "center",
      whiteSpace: "nowrap",
      transform: "translateX(-50%)", // Centra todas las etiquetas
    },
  }}
/>


        <Button variant="contained" color="primary" onClick={handleSave} sx={{ fontSize: "1.2rem", fontWeight: "bold", py: 1.5 }}>
          Save
        </Button>
      </Box>
    </Modal>
  );
};

export default StatusModal;
