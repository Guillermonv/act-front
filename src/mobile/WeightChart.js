import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";

// 🔥 Esta parte estaba faltando:
const interpolateWithinRange = (data, allDates) => {
  const result = [];

  if (data.length === 0) return result;

  const startDate = new Date(data[0].date).getTime();
  const endDate = new Date(data[data.length - 1].date).getTime();

  allDates.forEach(date => {
    const dateMs = new Date(date).getTime();

    if (dateMs < startDate || dateMs > endDate) {
      result.push({ x: dateMs, y: null });
      return;
    }

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
  const [data, setData] = useState(null);

  const fetchData = () => {
    fetch("http://44.204.238.86:80/weight/list")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error("Error cargando data:", err));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!data) return <div>Cargando datos...</div>;

  const allDates = Array.from(
    new Set([...data.ideal.map(d => d.date), ...data.current.map(d => d.date)])
  ).sort();

  const idealInterpolated = interpolateWithinRange(data.ideal, allDates);
  const currentInterpolated = interpolateWithinRange(data.current, allDates);

  const series = [
    { name: "Ideal", data: idealInterpolated },
    { name: "Actual", data: currentInterpolated }
  ];

  const options = {
    chart: { id: "weight-chart", type: "line", zoom: { enabled: false }, toolbar: { show: false } },
    xaxis: {
      type: "datetime",
      labels: {
        formatter: (value) => {
          const date = new Date(value);
          return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`;
        }
      }
    },
    yaxis: {
      title: { text: "Peso (kg)" },
      labels: { formatter: (value) => Math.floor(value) }
    },
    stroke: { curve: "smooth", width: 3 },
    markers: { size: 0 },
    legend: { show: false },
    colors: ["#008FFB", "#00E396"],
    tooltip: {
      shared: true,
      intersect: false,
      x: { format: "dd MMM yyyy" },
      y: { formatter: (val) => val !== null ? val.toFixed(2) : "-" }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { date: newDate, weight: parseFloat(newWeight) };
    fetch("http://44.204.238.86:80/weight/add", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al hacer el PUT");
        return res.json();
      })
      .then(() => {
        console.log("PUT exitoso");
        fetchData();
        setNewWeight("");
        setNewDate("");
      })
      .catch((err) => console.error("Error en PUT:", err));
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "1rem"
    }}>
      {/* Formulario angosto */}
      <form onSubmit={handleSubmit} style={{
        width: "90%",
        maxWidth: "400px", // 👈 no ocupa todo el ancho
        backgroundColor: "white",
        padding: "1rem",
        borderRadius: "1rem",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        marginBottom: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}>
        <div style={{
          fontSize: "1.2rem",
          color: "#555",
          textAlign: "center",
          fontFamily: "'Segoe UI', sans-serif",
          marginBottom: "0.5rem"
        }}>
          Peso Ideal: <strong>74 kg</strong>
        </div>

        <input
          type="number"
          value={newWeight}
          onChange={(e) => setNewWeight(e.target.value)}
          placeholder="Nuevo peso (kg)"
          style={{
            padding: "0.5rem",
            borderRadius: "0.5rem",
            border: "1px solid #ccc",
            fontSize: "1rem"
          }}
        />

        <input
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "0.5rem",
            border: "1px solid #ccc",
            fontSize: "1rem"
          }}
        />

        <button
          type="submit"
          style={{
            padding: "0.75rem",
            borderRadius: "0.5rem",
            border: "none",
            backgroundColor: "#8e44ad",
            color: "white",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer"
          }}
        >
          Agregar
        </button>
      </form>

      {/* Gráfico ocupa el 100% del ancho */}
      <div style={{ width: "100%" }}>
        <Chart options={options} series={series} type="line" height={300} width="100%" />
      </div>
    </div>
  );
};

export default WeightChart;
