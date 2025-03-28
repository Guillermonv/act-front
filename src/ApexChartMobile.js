import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const API_URL = "https://activit.free.beeceptor.com/api/v3/activities";

// Función para parsear la fecha en formato MM-DD
const parseDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return null; // Evita errores
  const [day, month] = dateStr.split("-").map(Number);
  if (!day || !month) return null; // Verifica que sean números válidos
  return `${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
};

// Función para formatear las fechas en el eje Y
const formatDateForYAxis = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return ""; // Devuelve vacío en vez de "N/A"
  const [month, day] = dateStr.split("-");
  return month && day ? `${month}-${day}` : "";
};

// Transforma los datos para el heatmap
const transformData = (data) => {
  console.log("API response:", data); // Para depuración

  if (!data || !data.activities) return [];

  const activityNames = Object.keys(data.activities);
  const uniqueDates = [...new Set(
    Object.values(data.activities)
      .flatMap((records) => records.map(({ date }) => parseDate(date)))
      .filter(Boolean) // FILTRA valores nulos o inválidos
  )].sort();

  return uniqueDates.map((date) => ({
    name: date,
    data: activityNames
      .map((activity) => {
        const records = data.activities[activity] || [];
        const record = records.find((r) => parseDate(r.date) === date);

        if (!record) return null; // No agrega si no hay datos válidos

        let yValue = null;
        if (record.status === "accomplished") yValue = 1;
        else if (record.status === "failed") yValue = 0;
        else if (record.status === "regular") yValue = 0.5;

        return yValue !== null ? { x: activity, y: yValue } : null;
      })
      .filter(Boolean), // FILTRA valores nulos
  })).filter((series) => series.data.length > 0); // Elimina series vacías
};

const ApexChartMobile = () => {
  const [chartData, setChartData] = useState({ series: [], options: {} });

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const series = transformData(data);
        console.log("Series final:", series); // Verificar si hay undefined

        setChartData({
          series,
          options: {
            chart: {
              height: 10600,
              width: 500,
              type: "heatmap",
            },
            plotOptions: {
              heatmap: {
                shadeIntensity: 0.7,
                radius: 0,
                useFillColorAsStroke: false,
                colorScale: {
                  ranges: [
                    { from: 0, to: 0, name: "Failed", color: "#FF0000" },
                    { from: 1, to: 1, name: "Accomplished", color: "#00A100" },
                    { from: 0.5, to: 0.5, name: "Regular", color: "#FFFF00" },
                  ],
                },
              },
            },
            dataLabels: {
              enabled: false,
            },
            xaxis: {
              type: "category",
              position: "top",
              labels: {
                rotate: -90,
                style: {
                  fontSize: "14px",
                  fontWeight: 600,
                },
              },
            },
            yaxis: {
              title: { text: "Dates" },
              opposite: false,
              labels: {
                formatter: (value) => {
                  console.log("y-axis value:", value); // Depuración
                  return formatDateForYAxis(value);
                },
                style: {
                  fontSize: "14px",
                  fontWeight: 600,
                },
              },
            },
            grid: {
              padding: { right: 5, left: 5 },
            },
          },
        });
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <ReactApexChart options={chartData.options} series={chartData.series} type="heatmap" height={10600} width={500} />
      <br />
    </div>
  );
};

export default ApexChartMobile;
