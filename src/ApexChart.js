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
    suck: 0.001,
    accomplished: 1,
    excellence: 1.2,
  };
  return statusMap[status] ?? null;
};

const ApexChart = () => {
  const [charts, setCharts] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("01");
  const [selectedCell, setSelectedCell] = useState(null);

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

          // Filtramos y ordenamos las fechas
          const uniqueDates = Object.keys(records)
            .filter((date) => {
              const d = new Date(date);
              return (d.getMonth() + 1).toString().padStart(2, "0") === month;
            })
            .sort();
          
          // Obtener el último día del mes seleccionado
          const lastDayOfMonth = new Date(`${new Date().getFullYear()}-${month}-01`);
          lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1); // Avanzamos al siguiente mes
          lastDayOfMonth.setDate(0); // Retrocedemos un día para obtener el último día del mes seleccionado
          
          // Convertimos el último día en formato 'YYYY-MM-DD'
          const lastDay = lastDayOfMonth.toISOString().split("T")[0];
          
          // Si el último día no está en la lista de fechas, lo agregamos al final
          if (!uniqueDates.includes(lastDay)) {
            uniqueDates.push(lastDay);
          }
          

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
    setSelectedCell(clickedData);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <br />
      <br />
      <div style={{ display: "flex", width: "100%" }}>
        <div style={{ display: "flex", marginLeft: "22%" }}>
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
          <span><span style={{ display: "inline-block",width: 10, height: 10, backgroundColor: "#000000", marginRight: 5 }}></span> Sucky</span>
          <span><span style={{ display: "inline-block",width: 10, height: 10, backgroundColor: "#FF0000", marginRight: 5 }}></span> Failed</span>
          <span><span style={{display: "inline-block", width: 10, height: 10, backgroundColor: "#FFFF00", marginRight: 5 }}></span> Regular</span>
          <span><span style={{ display: "inline-block",width: 10, height: 10, backgroundColor: "#00A100", marginRight: 5 }}></span> Accomplished</span>
          <span><span style={{display: "inline-block", width: 10, height: 10, backgroundColor: "#0000FF", marginRight: 5 }}></span> Excellence</span>
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
                formatter: (value) => new Date(value).getDate(),
                style: {
                  fontSize: "17px",
                  fontFamily: "Arial",
                  fontWeight: 400,
                },
              },
            },
            yaxis: {
              title: { text: "" },
              labels: {
                style: {
                  fontSize: "19x",
                  fontFamily: "Arial",
                  fontWeight: 400,
                },
              },
            },
          }}
          series={charts[selectedMonth].series}
          type="heatmap"
          height={400}
          width={1300}
        />
      )}

      <StatusModal selectedCell={selectedCell} setSelectedCell={setSelectedCell} refreshData={fetchData} />
    </div>
  );
};

export default ApexChart;
