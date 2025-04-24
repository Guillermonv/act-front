import React, { useState } from "react";
import Chart from "react-apexcharts";

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

  const options = {
    chart: {
      id: "weight-chart",
      type: "line",
      zoom: { enabled: false }
    },
    xaxis: {
      type: "datetime",
      title: { text: "Fecha" },
      labels: {
        datetimeFormatter: {
          month: "MMM",
          year: "yyyy"
        }
      }
    },
    yaxis: {
      title: { text: "Peso (kg)" }
    },
    stroke: {
      curve: "smooth"
    },
    markers: {
      size: 4
    },
    legend: {
      position: "top"
    }
  };

  const series = [
    {
      name: "Ideal",
      data: data.ideal.map(d => ({ x: new Date(d.date).getTime(), y: d.weight }))
    },
    {
      name: "Actual",
      data: data.current.map(d => ({ x: new Date(d.date).getTime(), y: d.weight }))
    }
  ];

  return (
    <div style={{ display: "flex", justifyContent: "center"}}>
      <div style={{ width: "55%", padding: "1rem", backgroundColor: "white", borderRadius: "1rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
        
        {/* Formulario */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          
          {/* Nuevo Peso */}
          <div style={{ flex: 1, textAlign: "left" }}>
            <label style={{ fontWeight: "bold" }}>Nuevo Peso:</label>
            <input
              type="number"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="kg"
              style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #ccc", width: "100%" }}
            />
          </div>

          {/* Peso Ideal */}
          <div style={{ flex: 1, textAlign: "center", fontWeight: "bold" }}>
            Peso Ideal: 75
          </div>

          {/* Date Picker */}
          <div style={{ flex: 1, textAlign: "right" }}>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid #ccc", width: "100%" }}
            />
          </div>
        </div>
        
        {/* Gráfico */}
        <Chart options={options} series={series} type="line" height={350} width="100%" />
      </div>
    </div>
  );
};

export default WeightChart;
