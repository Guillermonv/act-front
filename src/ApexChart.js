import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import StatusModal from "./form/StatusModal";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

// Establecer las fuentes elegantes
import "@fontsource/roboto";  // Fuente Roboto
import "@fontsource/montserrat";  // Fuente Montserrat

const API_URL = "http://localhost:8080/activities/grouped";

const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("-").map(Number);
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
};

const transformData = (data) => {
  const recordsByMonth = {};
  Object.entries(data.activities).forEach(([activity, records]) => {
    records.forEach((record) => {
      const formattedDate = parseDate(record.date);
      if (!recordsByMonth[formattedDate]) recordsByMonth[formattedDate] = {};
      recordsByMonth[formattedDate][activity] = record.status;
    });
  });
  return recordsByMonth;
};

const mapStatusToValue = (status) => {
  const normalized = (status || "").toLowerCase();
  const statusMap = {
    failed: 0.2,
    regular: 0.5,
    suck: 0.001,
    accomplished: 1,
    excellence: 1.2,
  };
  return statusMap[normalized] ?? null;
};

const ApexChart = () => {
  const [charts, setCharts] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("01");
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null); // Estado para el filtro de color

  const fetchData = () => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const transformedData = transformData(data);
        const chartConfigs = {};

        Object.entries(transformedData).forEach(([date, records]) => {
          const month = date.split("-")[1];
          if (!chartConfigs[month]) chartConfigs[month] = { records: {}, series: [] };
          chartConfigs[month].records[date] = records;
        });

        Object.keys(chartConfigs).forEach((month) => {
          const records = chartConfigs[month].records;

          // Obtenemos las fechas con datos y las ordenamos
          const uniqueDates = Object.keys(records).sort((a, b) => new Date(a) - new Date(b));
          const activities = [...new Set(Object.values(records).flatMap(Object.keys))];

          chartConfigs[month].series = activities.map((activity) => ({
            name: activity,
            data: uniqueDates.map((date) => {
              const status = records[date]?.[activity] || "";
              return {
                x: date,
                y: mapStatusToValue(status),
                date,
                status: status || "no status",
                activity,
              };
            }),
          }));
        });

        setCharts(chartConfigs);
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCellClick = (event, chartContext, config) => {
    const { dataPointIndex, seriesIndex } = config;
    if (dataPointIndex === undefined || seriesIndex === undefined) return;

    const selectedSeries = charts[selectedMonth]?.series[seriesIndex];
    if (!selectedSeries) return;

    const clickedData = selectedSeries.data[dataPointIndex];

    setSelectedCell({
      ...clickedData,
      date: clickedData.date,
    });
  };

  // Función para manejar el cambio de color en la leyenda
  const handleStatusClick = (status) => {
    // Si el estado ya está seleccionado, desactivamos el filtro
    setSelectedStatus(prevStatus => (prevStatus === status ? null : status));
  };

  // Filtrar los datos según el estado seleccionado
  const filterSeriesByStatus = (series) => {
    if (!selectedStatus) return series; // Si no hay filtro, retornamos todas las series

    return series.map((s) => ({
      ...s,
      data: s.data.map((d) => ({
        ...d,
        y: d.status.toLowerCase() === selectedStatus.toLowerCase() ? d.y : null,
      })),
    }));
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "1.5rem", fontFamily: "Roboto, sans-serif" }}>
      <div style={{ width: "55%", padding: "1rem", backgroundColor: "white", borderRadius: "1rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
      <div style={{ display: "flex", width: "100%" }}>
        <div style={{ display: "flex", marginLeft: "0%" }}>
          <FormControl variant="outlined" style={{ minWidth: 150 }}>
            <InputLabel>Mes</InputLabel>
            <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} label="Mes">
              {Array.from({ length: 12 }, (_, i) => {
                const month = (i + 1).toString().padStart(2, "0");
                return (
                  <MenuItem key={month} value={month}>
                    {new Date(2024, i).toLocaleString("default", { month: "long" })}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1, gap: "12px", marginRight: "22%" }}>
          <span onClick={() => handleStatusClick("suck")} style={{ fontFamily: "Montserrat, sans-serif", fontWeight: "500", cursor: "pointer" }}><span style={{ display: "inline-block", width: 10, height: 10, backgroundColor: "#000000", marginRight: 5 }}></span> Suck</span>
          <span onClick={() => handleStatusClick("failed")} style={{ fontFamily: "Montserrat, sans-serif", fontWeight: "500", cursor: "pointer" }}><span style={{ display: "inline-block", width: 10, height: 10, backgroundColor: "#FF0000", marginRight: 5 }}></span> Failed</span>
          <span onClick={() => handleStatusClick("regular")} style={{ fontFamily: "Montserrat, sans-serif", fontWeight: "500", cursor: "pointer" }}><span style={{ display: "inline-block", width: 10, height: 10, backgroundColor: "#FFFF00", marginRight: 5 }}></span> Regular</span>
          <span onClick={() => handleStatusClick("accomplished")} style={{ fontFamily: "Montserrat, sans-serif", fontWeight: "500", cursor: "pointer" }}><span style={{ display: "inline-block", width: 10, height: 10, backgroundColor: "#00A100", marginRight: 5 }}></span> Accomplished</span>
          <span onClick={() => handleStatusClick("excellence")} style={{ fontFamily: "Montserrat, sans-serif", fontWeight: "500", cursor: "pointer" }}><span style={{ display: "inline-block", width: 10, height: 10, backgroundColor: "#0000FF", marginRight: 5 }}></span> Excellence</span>
        </div>
      </div>

      {charts[selectedMonth] && (
        <ReactApexChart
          options={{
            chart: { type: "heatmap", events: { dataPointSelection: handleCellClick } },
            plotOptions: {
              heatmap: {
                shadeIntensity: 0.5,
                radius: 0,
                colorScale: {
                  ranges: [
                    { from: 0.001, to: 0.001, name: "Suck", color: "#000000" },
                    { from: 0.2, to: 0.2, name: "Failed", color: "#FF0000" },
                    { from: 0.5, to: 0.5, name: "Regular", color: "#FFFF00" },
                    { from: 1, to: 1, name: "Accomplished", color: "#00A100" },
                    { from: 1.2, to: 1.2, name: "Excellence", color: "#0000FF" },
                    { from: null, to: null, name: "No Status", color: "#FFFFFF" },
                  ],
                },
              },
            },
            legend: { show: false },
            dataLabels: { enabled: false },
            xaxis: {
              type: "category",
              labels: {
                formatter: (val) => val.split("-")[2], // Mostrar solo el día
                style: {
                  fontSize: "16px",
                  fontFamily: "Roboto, sans-serif",
                  fontWeight: 400,
                },
              },
            },
            yaxis: {
              title: { text: "" },
              labels: {
                style: {
                  fontSize: "16px",
                  fontFamily: "Roboto, sans-serif",
                  fontWeight: 400,
                },
              },
            },
          }}
          series={filterSeriesByStatus(charts[selectedMonth].series)} // Aplicamos el filtro
          type="heatmap"
          height="150%"
          width="100%"
        />
      )}

      <StatusModal selectedCell={selectedCell} setSelectedCell={setSelectedCell} refreshData={fetchData} />
    </div>
    </div>
  );
};

export default ApexChart;
