import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const API_URL = "https://activity1.free.beeceptor.com/api/v3/activities";

// Función para parsear la fecha y mantenerla original
const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("-").map(Number);
  // Se mantiene el formato original para la fecha completa
  return { day, month, year, formatted: `${day.toString().padStart(2, "0")}-${month.toString().padStart(2, "0")}-${year}` };
};

// Transformar datos en series adecuadas para ApexCharts
const transformData = (data) => {
  if (!data.activities) return [];

  const activityNames = Object.keys(data.activities);
  const uniqueDates = [
    ...new Set(Object.values(data.activities).flatMap((records) => records.map(({ date }) => parseDate(date).day))) // Usamos solo el día para el gráfico
  ].sort((a, b) => a - b);

  return uniqueDates.map((day) => ({
    name: day.toString(), // Día en el eje Y
    data: activityNames.map((activity) => {
      const record = data.activities[activity]?.find((r) => parseDate(r.date).day === day);
      let yValue = null;
      if (record) {
        if (record.status === "accomplished") yValue = 1;
        else if (record.status === "failed") yValue = 0;
        else if (record.status === "regular") yValue = 0.5;
      }
      return { x: activity, y: yValue };
    }),
  }));
};

const ApexChartMobile = () => {
  const [chartData, setChartData] = useState({ series: [], options: {} });

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const series = transformData(data);
        if (series.length === 0) return;

        const numRows = series.length; // Cantidad de días
        const numCols = series[0]?.data.length || 0; // Cantidad de actividades

        const cellSize = 50; // Tamaño de cada celda
        const chartHeight = numRows * cellSize;
        const chartWidth = numCols * cellSize;

        setChartData({
          series,
          options: {
            chart: { height: chartHeight, width: chartWidth, type: "heatmap" },
            plotOptions: {
              heatmap: {
                shadeIntensity: 0.7,
                radius: 0,
                useFillColorAsStroke: true,
                colorScale: {
                  ranges: [
                    { from: 0, to: 0, name: "Failed", color: "#FF0000" },
                    { from: 1, to: 1, name: "Accomplished", color: "#00A100" },
                    { from: 0.5, to: 0.5, name: "Regular", color: "#FFFF00" },
                  ],
                },
              },
            },
            dataLabels: { enabled: false },
            title: { text: "Activity HeatMap" },
            xaxis: {
              type: "category",
              title: { text: "Activities" },
              position: "top",
              labels: {
                rotate: -90,
                style: { fontSize: "14px", fontWeight: 600 },
              },
            },
            yaxis: {
              title: { text: "Days" },
              labels: { style: { fontSize: "14px", fontWeight: 600 } },
            },
            grid: { padding: { right: 5, left: 5 } },
          },
        });
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h2>Activity Heatmap</h2>
      {chartData.series.length > 0 ? (
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="heatmap"
          height={chartData.options.chart.height}
          width={chartData.options.chart.width}
        />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default ApexChartMobile;
