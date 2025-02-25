import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const API_URL = "https://activit.free.beeceptor.com/api/v3/activities";

// Función para convertir la fecha de DD-MM-YYYY a YYYY-MM-DD
const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("-").map(Number);
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
};

// Transformar los datos para que las fechas sean las filas y las actividades las columnas
const transformData = (data) => {
  const activityNames = Object.keys(data.activities);

  // Obtener todas las fechas únicas
  const uniqueDates = [
    ...new Set(Object.values(data.activities).flatMap((records) => records.map(({ date }) => parseDate(date)))),
  ].sort();

  // Construimos la serie basada en fechas
  return uniqueDates.map((date) => ({
    name: date, // Fechas en el eje Y
    data: activityNames.map((activity) => {
      // Buscar si hay un registro para esta actividad y esta fecha
      const record = data.activities[activity]?.find((r) => parseDate(r.date) === date);
      let yValue = null;
      if (record) {
        if (record.status === "accomplished") yValue = 1;
        else if (record.status === "failed") yValue = 0;
        else if (record.status === "regular") yValue = 0.5;
      }

      return { x: activity, y: yValue }; // Actividades en el eje X
    }),
  }));
};

const ApexChart = () => {
  const [chartData, setChartData] = useState({ series: [], options: {} });

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const series = transformData(data);

        setChartData({
          series,
          options: {
            chart: {
              height: 9000,
              type: "heatmap",
            },
            plotOptions: {
              heatmap: {
                shadeIntensity: 0.5,
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
            dataLabels: {
              enabled: false,
            },
            title: {
              text: "Activity HeatMap",
            },
            xaxis: {
              type: "category",
              title: { text: "Activities" }, // Actividades en el eje X
            },
            yaxis: {
              title: { text: "Dates" }, // Fechas en el eje Y
              labels: {
                style: {
                  fontSize: "12px",
                  minHeight: 200,  // Asegura que cada fila tenga espacio suficiente
                },
              },
            },
          },
        });
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div>
      <h2>Activity Heatmap</h2>
      <ReactApexChart options={chartData.options} series={chartData.series} type="heatmap" height={9000} />
    </div>
  );
};

export default ApexChart;
