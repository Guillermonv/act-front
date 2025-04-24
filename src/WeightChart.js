import React, { useState } from "react";
import Chart from "react-apexcharts";

// Interpolación lineal entre puntos
const interpolate = (data, allDates) => {
  const result = [];

  allDates.forEach(date => {
    const dateMs = new Date(date).getTime();
    let i = 0;

    while (i < data.length && new Date(data[i].date).getTime() < dateMs) {
      i++;
    }

    if (i === 0) {
      result.push({ x: dateMs, y: data[0].weight });
    } else if (i === data.length) {
      result.push({ x: dateMs, y: data[data.length - 1].weight });
    } else {
      const prev = data[i - 1];
      const next = data[i];
      const t = (dateMs - new Date(prev.date).getTime()) / (new Date(next.date).getTime() - new Date(prev.date).getTime());
      const y = prev.weight + t * (next.weight - prev.weight);
      result.push({ x: dateMs, y });
    }
  });

  return result;
};

const WeightChart = () => {
  const [newWeight, setNewWeight] = useState("");
  const [newDate, setNewDate] = useState("");

  const data = {
    ideal: [
      { weight: 84, date: "2025-01-01" },
      { weight: 75, date: "2025-12-31" }
    ],
    current: [
      { weight: 84, date: "2025-01-01" },
      { weight: 83, date: "2025-02-01" },
      { weight: 82, date: "2025-03-01" },
      { weight: 81, date: "2025-04-01" },
      { weight: 80, date: "2025-05-01" },
      { weight: 79, date: "2025-06-01" },
      { weight: 78, date: "2025-07-01" },
      { weight: 77, date: "2025-08-01" },
      { weight: 76, date: "2025-09-01" },
      { weight: 75, date: "2025-10-01" },
      { weight: 74, date: "2025-11-01" },
      { weight: 73, date: "2025-12-01" }
    ]
  };

  // Fechas únicas combinadas
  const allDates = Array.from(new Set([
    ...data.ideal.map(d => d.date),
    ...data.current.map(d => d.date)
  ])).sort();

  const series = [
    {
      name: "Ideal",
      data: interpolate(data.ideal, allDates)
    },
    {
      name: "Actual",
      data: interpolate(data.current, allDates)
    }
  ];

  const options = {
    chart: {
      id: "weight-chart",
      type: "line",
      zoom: { enabled: false },
      toolbar: { show: false }
    },
    xaxis: {
      type: "datetime",
      title: { text: "Fecha" },
      labels: {
        formatter: function (value) {
          const date = new Date(value);
          return date.getDate() + " " + date.toLocaleString("default", { month: "short" }) + " " + date.getFullYear();
        }
      }
    },
    yaxis: {
      title: { text: "Peso (kg)" },
      labels: {
        formatter: function (value) {
          return Math.floor(value); // Sin decimales en el eje Y
        }
      }
    },
    stroke: {
      curve: "smooth"
    },
    markers: {
      size: 4
    },
    legend: {
      show: false
    },
    colors: ["#008FFB", "#00E396"],
    tooltip: {
      shared: true,
      intersect: false,
      x: {
        format: "dd MMM yyyy"
      },
      y: {
        formatter: function (value) {
          return value.toFixed(2); // Limitar a 2 decimales
        }
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Nuevo peso:", newWeight, "Fecha:", newDate);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{
        width: "55%",
        padding: "1.5rem",
        backgroundColor: "white",
        borderRadius: "1rem",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif"
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "1.5rem",
            flexWrap: "wrap"
          }}>
            <div style={{ minWidth: "120px", textAlign: "left" }}>
              <div style={{
                fontSize: "1.2rem",
                color: "#555",
                fontFamily: "'Segoe UI', sans-serif"
              }}>
                Peso Ideal: <strong>75 kg</strong>
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexShrink: 0,
              flexGrow: 1,
              justifyContent: "flex-end"
            }}>
              <div style={{ display: "flex", gap: "1rem", marginRight: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <div style={{ width: "14px", height: "14px", backgroundColor: "#008FFB", borderRadius: "50%" }}></div>
                  <span style={{ color: "#444", fontSize: "0.9rem" }}>Ideal</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <div style={{ width: "14px", height: "14px", backgroundColor: "#00E396", borderRadius: "50%" }}></div>
                  <span style={{ color: "#444", fontSize: "0.9rem" }}>Actual</span>
                </div>
              </div>

              <input
                type="number"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Nuevo peso (kg)"
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #ccc",
                  width: "120px",
                  fontSize: "0.9rem"
                }}
              />
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #ccc",
                  fontSize: "0.9rem"
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "0.55rem 1.1rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  backgroundColor: "#8e44ad",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  cursor: "pointer"
                }}
              >
                Agregar
              </button>
            </div>
          </div>
        </form>

        <Chart options={options} series={series} type="line" height={300} width="100%" />
      </div>
    </div>
  );
};

export default WeightChart;
