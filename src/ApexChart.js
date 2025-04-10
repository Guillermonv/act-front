import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import StatusModal from "./form/StatusModal";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

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
  const statusMap = {
    failed: 0.2,
    regular: 0.5,
    suck: 0.001, // En vez de 0, usamos un valor pequeño
    accomplished: 1,
    excellence: 1.2,
  };
  return statusMap[status] ?? null;
};

const ApexChart = () => {
  const [charts, setCharts] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("01");
  const [selectedCell, setSelectedCell] = useState(null);

  useEffect(() => {
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
          const uniqueDates = Object.keys(records).sort();
          const activities = [...new Set(Object.values(records).flatMap(Object.keys))];

          chartConfigs[month].series = activities.map((activity) => ({
            name: activity,
            data: uniqueDates.map((date) => ({
              x: date,
              y: mapStatusToValue(records[date]?.[activity] || "failed"),
              status: records[date]?.[activity] || "failed",
              activity,
            })),
          }));
        });

        setCharts(chartConfigs);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleCellClick = (event, chartContext, config) => {
    const { dataPointIndex, seriesIndex } = config;
    if (dataPointIndex === undefined || seriesIndex === undefined) return;

    const selectedSeries = charts[selectedMonth]?.series[seriesIndex];
    if (!selectedSeries) return;

    const clickedData = selectedSeries.data[dataPointIndex];
    setSelectedCell(clickedData);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <br />
      <br />
      {/* Contenedor para el Selector y las Leyendas */}
      <div style={{ display: "flex", width: "100%" }}>
        <div style={{ display: "flex", marginLeft: "22%" }}>
          {/* Este es el div con el contenido alineado a la izquierda con un margen de 7% */}
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

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexGrow: 1, gap: "12px" ,marginRight: "22%" }}>
          <span style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: 10, height: 10, backgroundColor: "#000000", marginRight: 5 }}></span> Suck
          </span>
          <span style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: 10, height: 10, backgroundColor: "#FF0000", marginRight: 5 }}></span> Failed
          </span>
          <span style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: 10, height: 10, backgroundColor: "#FFFF00", marginRight: 5 }}></span> Regular
          </span>
          <span style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: 10, height: 10, backgroundColor: "#00A100", marginRight: 5 }}></span> Accomplished
          </span>
          <span style={{ display: "flex", alignItems: "center" }}>
            <span style={{ width: 10, height: 10, backgroundColor: "#0000FF", marginRight: 5 }}></span> Excellence
          </span>
        </div>
      </div>

      {/* Heatmap */}
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
                    { from: 0.001, to: 0.001, name: "Suck", color: "#000000" }, // Ajustamos para detectar el nuevo valor
                    { from: 0.2, to: 0.2, name: "Failed", color: "#FF0000" },
                    { from: 0.5, to: 0.5, name: "Regular", color: "#FFFF00" },
                    { from: 1, to: 1, name: "Accomplished", color: "#00A100" },
                    { from: 1.2, to: 1.2, name: "Excellence", color: "#0000FF" },
                    { from: null, to: null, name: "No Status", color: "#FFFFFF" },
                  ],
                },
              },
            },
            legend: {
              show: false,
              fontSize: "12px",
              markers: { width: 10, height: 10 },
            },
            dataLabels: { enabled: false },
            xaxis: {
              type: "category",
              labels: {
                formatter: (value) => new Date(value).getDate(),
              },
            },
            yaxis: { title: { text: "" } },
          }}
          series={charts[selectedMonth].series}
          type="heatmap"
          height={400}
          width={2000}
        />
      )}

      <StatusModal selectedCell={selectedCell} setSelectedCell={setSelectedCell} />
    </div>
  );
};

export default ApexChart;
