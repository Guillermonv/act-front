import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const UPDATE_API_URL = "https://your-api.com/update"; // Cambiar por la API real

const StatusModal = ({ selectedCell, setSelectedCell }) => {
  if (!selectedCell) return null;

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setSelectedCell((prev) => ({ ...prev, status: newStatus }));

    fetch(UPDATE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedCell.x, activity: selectedCell.activity, status: newStatus })
    }).then(() => console.log("Updated successfully"));
  };

  return (
    <Modal open={!!selectedCell} onClose={() => setSelectedCell(null)}>
      <Box
        sx={{
          p: 4,
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: 6,
          maxWidth: 420,
          margin: "auto",
          mt: 10,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          position: "relative",
        }}
      >
        <IconButton
          sx={{ position: "absolute", top: 10, right: 10 }}
          onClick={() => setSelectedCell(null)}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h6" fontWeight="bold" color="primary">
          Edit Status
        </Typography>

        <Typography variant="body1" color="text.secondary">
          <strong>Activity:</strong> {selectedCell.activity}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          <strong>Date:</strong> {selectedCell.x}
        </Typography>

        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select value={selectedCell.status} onChange={handleStatusChange}>
            <MenuItem value="failed">Failed</MenuItem>
            <MenuItem value="regular">Regular</MenuItem>
            <MenuItem value="suck">Suck</MenuItem>
            <MenuItem value="accomplished">Accomplished</MenuItem>
            <MenuItem value="excellence">Excellence</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" onClick={() => setSelectedCell(null)}>
          Save & Close
        </Button>
      </Box>
    </Modal>
  );
};

export default StatusModal;
