import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const API_URL = "http://44.204.238.86:80/activities/grouped";

const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("-").map(Number);
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
};

const transformData = (data) => {
  const activityNames = Object.keys(data.activities);
  const uniqueDates = [...new Set(
    Object.values(data.activities).flatMap((records) =>
      records.map(({ date }) => parseDate(date))
    )
  )].sort();

  return {
    series: uniqueDates.map((date) => ({
      name: date,
      data: activityNames.map((activity) => {
        const record = data.activities[activity]?.find((r) => parseDate(r.date) === date);
        let yValue = null;
        if (record) {
          if (record.status.toLowerCase() === "suck") yValue = 0.001;
          else if (record.status.toLowerCase() === "failed") yValue = 0.2;
          else if (record.status.toLowerCase() === "regular") yValue = 0.5;
          else if (record.status.toLowerCase() === "accomplished") yValue = 1;
          else if (record.status.toLowerCase() === "excellence") yValue = 1.2;
        }
        return { x: activity, y: yValue };
      }),
    })),
    categories: activityNames,
  };
};

const ApexChartMobile = () => {
  const [chartData, setChartData] = useState({ series: [], options: {} });

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const { series, categories } = transformData(data);

        setChartData({
          series,
          options: {
            chart: {
              type: "heatmap",
              toolbar: { show: false },
            },
            plotOptions: {
              heatmap: {
                shadeIntensity: 0,
                radius: 0,
                useFillColorAsStroke: false,
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
            dataLabels: { enabled: false },
            xaxis: {
              categories: categories,
              position: "top", // Actividades arriba
              labels: {
                rotate: -45, // Etiquetas inclinadas
                style: {
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "Roboto, sans-serif",
                },
              },
            },
            yaxis: {
              opposite: false,
              labels: {
                style: {
                  fontSize: "12px",
                  fontWeight: 600,
                  fontFamily: "Roboto, sans-serif",
                },
              },
            },
            grid: {
              padding: {
                left: 50, // ⬅️ mueve todo el gráfico a la derecha
                right: 20,
                top: 20,
                bottom: 20,
              },
            },
            title: {
              align: "center",
              style: {
                fontSize: "18px",
                fontWeight: "bold",
                fontFamily: "Montserrat, sans-serif",
              },
            },
          },
        });
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "1rem" }}>
      <div style={{ maxWidth: "95vw", backgroundColor: "white", padding: "1rem", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="heatmap"
          height={4000}
          width={400}
        />
      </div>
    </div>
  );
};

export default ApexChartMobile;
