import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const API_URL = "https://blockchainprovider.free.beeceptor.com/api/v3/activities";

const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("-").map(Number);
  return { year, month, day, formatted: `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}` };
};

const transformData = (data) => {
  const activityNames = Object.keys(data.activities);
  const recordsByMonth = {};

  activityNames.forEach((activity) => {
    data.activities[activity].forEach((record) => {
      const { year, month, formatted } = parseDate(record.date);
      const key = `${year}-${month.toString().padStart(2, "0")}`;

      if (!recordsByMonth[key]) recordsByMonth[key] = {};
      if (!recordsByMonth[key][formatted]) recordsByMonth[key][formatted] = {};
      recordsByMonth[key][formatted][activity] = record.status;
    });
  });
  return recordsByMonth;
};

const mapStatusToValue = (status) => {
  switch (status) {
    case "accomplished": return 1;
    case "failed": return 0;
    case "regular": return 0.5;
    default: return null;
  }
};

const generateChartData = (records) => {
  const uniqueDates = Object.keys(records).sort();
  const activityNames = [...new Set(Object.values(records).flatMap(Object.keys))];

  return activityNames.map((activity) => ({
    name: activity,
    data: uniqueDates.map((date) => {
      const status = records[date][activity];
      return { x: date, y: mapStatusToValue(status) || 0 };
    })
  }));
};

const ApexChart = () => {
  const [charts, setCharts] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("01");

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const transformedData = transformData(data);
        const chartConfigs = {};

        Object.entries(transformedData).forEach(([month, records]) => {
          const uniqueDates = Object.keys(records).sort();
          const activityNames = [...new Set(Object.values(records).flatMap(Object.keys))];

          const numRows = activityNames.length; 
          const numCols = uniqueDates.length;

          // Tamaño base del gráfico (Doble de grande)
          const baseSize =55; // Cada celda ahora es más grande
          const chartHeight = numRows * baseSize; 
          const chartWidth = numCols * baseSize;

          chartConfigs[month] = {
            series: generateChartData(records),
            options: {
              chart: { height: chartHeight, width: chartWidth, type: "heatmap" },
              plotOptions: {
                heatmap: {
                  shadeIntensity: 0.7,
                  radius: 0,
                  useFillColorAsStroke: false,
                  colorScale: {
                    ranges: [
                      { from: 0, to: 0, name: "Failed", color: "#FF0000" }, // Rojo
                      { from: 1, to: 1, name: "Accomplished", color: "#00A100" }, // Verde
                      { from: 0.5, to: 0.5, name: "Regular", color: "#FFFF00" }, // Amarillo
                    ],
                  },
                },
              },
              dataLabels: { enabled: false },
              title: { text: `Activity Heatmap - ${month}` },
              xaxis: { type: "category", title: { text: "Dates" } },
              yaxis: { title: { text: "Activities" } },
            },
          };
        });

        setCharts(chartConfigs);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h2>Activity Heatmap</h2>
      <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
        {Array.from({ length: 12 }, (_, i) => {
          const month = (i + 1).toString().padStart(2, "0");
          return (
            <option key={month} value={month}>
              {new Date(2024, i).toLocaleString("default", { month: "long" })}
            </option>
          );
        })}
      </select>
      {Object.entries(charts)
        .filter(([month]) => month.split("-")[1] === selectedMonth)
        .map(([month, config]) => (
          <div key={month}>
            <h3>{month}</h3>
            <ReactApexChart options={config.options} series={config.series} type="heatmap" height={config.options.chart.height} width={config.options.chart.width} />
          </div>
        ))}
    </div>
  );
};

export default ApexChart;
