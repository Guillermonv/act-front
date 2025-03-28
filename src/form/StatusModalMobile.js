import React from "react";
import { Modal, Box, Typography, Button, FormControl, Select, MenuItem, InputLabel } from "@mui/material";

// Definir estilos para el modal
const modalStyle = {
  position: "absolute",
  top: "25%", // 25% desde el top para dejar un margen
  left: "50%",
  transform: "translate(-50%, -25%)", // Centrar el modal
  width: "50%", // 50% del ancho de la pantalla
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
};

const StatusModalMobile = ({ open, onClose, status, onChangeStatus, onSave }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" gutterBottom>
          Update Activity Status
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            id="status-select"
            value={status}
            label="Status"
            onChange={(e) => onChangeStatus(e.target.value)}
          >
            <MenuItem value="accomplished">Accomplished</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="regular">Regular</MenuItem>
            <MenuItem value="suck">Suck</MenuItem>
            <MenuItem value="excellence">Excellence</MenuItem>
          </Select>
        </FormControl>
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button onClick={onClose} variant="outlined" color="error">
            Cancel
          </Button>
          <Button onClick={onSave} variant="contained" color="primary">
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default StatusModalMobile;
