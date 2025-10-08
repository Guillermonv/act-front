import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";

// Interpolación lineal controlando límites
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
    new Set([
      ...data.ideal.map(d => d.date),
      ...data.current.map(d => d.date)
    ])
  ).sort();

  const idealInterpolated = interpolateWithinRange(data.ideal, allDates);
  const currentInterpolated = interpolateWithinRange(data.current, allDates);

  const series = [
    { name: "Ideal", data: idealInterpolated },
    { name: "Actual", data: currentInterpolated }
  ];

  const options = {
    chart: {
      id: "weight-chart",
      type: "line",
      zoom: { enabled: false },
      toolbar: { show: false },
      fontFamily: "Roboto, sans-serif"
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          fontFamily: "Roboto, sans-serif",
          fontSize: "0.9rem",
          fontWeight: "500"
        },
        formatter: (value) => {
          const date = new Date(value);
          return `${date.getDate()} ${date.toLocaleString("default", { month: "short" })}`;
        }
      }
    },
    yaxis: {
      title: {
        text: "Peso (kg)",
        style: {
          fontFamily: "Roboto, sans-serif",
          fontSize: "0.9rem",
          fontWeight: "500"
        }
      },
      labels: {
        style: {
          fontFamily: "Roboto, sans-serif",
          fontSize: "0.9rem",
          fontWeight: "500"
        },
        formatter: (value) => Math.floor(value)
      }
    },
    stroke: {
      curve: "smooth",
      width: 3
    },
    markers: {
      size: 0
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
        formatter: (val) => val !== null ? val.toFixed(2) : "-",
        title: {
          style: {
            fontFamily: "Roboto, sans-serif",
            fontSize: "0.9rem",
            fontWeight: "500"
          }
        }
      },
      style: {
        fontFamily: "Roboto, sans-serif",
        fontSize: "0.9rem",
        fontWeight: "500"
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      date: newDate,
      weight: parseFloat(newWeight),
    };

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
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{
        width: "55%",
        padding: "1.5rem",
        backgroundColor: "white",
        borderRadius: "1rem",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        fontFamily: "Roboto, sans-serif",
        fontSize: "0.9rem",
        fontWeight: "500"
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
                fontSize: "0.9rem",
                fontWeight: "500",
                color: "#555",
                fontFamily: "Roboto, sans-serif"
              }}>
                Peso Ideal: <strong>74 kg</strong>
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
                  <span style={{
                    fontFamily: "Roboto, sans-serif",
                    fontWeight: "500",
                    fontSize: "0.9rem",
                    color: "#444"
                  }}>
                    Ideal
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <div style={{ width: "14px", height: "14px", backgroundColor: "#00E396", borderRadius: "50%" }}></div>
                  <span style={{
                    fontFamily: "Roboto, sans-serif",
                    fontWeight: "500",
                    fontSize: "0.9rem",
                    color: "#444"
                  }}>
                    Actual
                  </span>
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
                  fontSize: "0.9rem",
                  fontFamily: "Roboto, sans-serif",
                  fontWeight: "500"
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
                  fontSize: "0.9rem",
                  fontFamily: "Roboto, sans-serif",
                  fontWeight: "500"
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
                  fontWeight: "500",
                  fontSize: "0.9rem",
                  fontFamily: "Roboto, sans-serif",
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
