import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import StatusModal from "./form/StatusModal";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const API_URL = "https://demoguille.free.beeceptor.com/api/v3/activities";

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
    suck: 0,
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <br />
      <br />

      <div>
        <FormControl variant="outlined" style={{ minWidth: 150, marginRight: 0 }}>
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
                    { from: 0, to: 0, name: "Suck", color: "#000000" },
                    { from: 0.2, to: 0.2, name: "Failed", color: "#FF0000" },
                    { from: 0.5, to: 0.5, name: "Regular", color: "#FFFF00" },
                    { from: 1, to: 1, name: "Accomplished", color: "#00A100" },
                    { from: 1.2, to: 1.2, name: "Excellence", color: "#0000FF" },
                  ],
                },
              },
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
