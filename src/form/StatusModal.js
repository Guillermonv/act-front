import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import Button from "@mui/material/Button";

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
          p: 7,
          bgcolor: "grey",
          borderRadius: 2,
          boxShadow: 0,
          width: "90vw", // Se adapta al tamaño de la pantalla
          maxWidth: 650, // Límite de ancho
          maxHeight: 750, // Aumentamos el alto máximo
          margin: "auto",
          mt: 18,
          display: "flex",
          flexDirection: "column",
          gap: 1, // Aumentamos el espacio entre los elementos
          fontFamily: "Arial, sans-serif",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.3rem", marginTop: 0 }}>
            <strong>Date:</strong> {selectedCell.x}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.3rem", marginTop: 0 }}>
            <strong>Activity:</strong> {selectedCell.activity}
          </Typography>
        </Box>

        <Slider
          value={selectedCell.status}
          step={0.01}
          marks={statusLevels.map(({ value, label, color }) => ({
            value,
            label: (
              <span style={{ color: color, fontSize: "1.2rem", fontWeight: "bold" }}>
                {label}
              </span>
            ),
          }))}
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

        <br /><br />
        {/* Contenedor que empuja el botón hacia abajo */}
        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="contained"
          color="green"
          onClick={handleSave}
          sx={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            py: 1.5,
            mt: "auto", // Asegura que el botón se posicione en la parte inferior
          }}
        >
          Save
        </Button>
      </Box>
    </Modal>
  );
};

export default StatusModal;
