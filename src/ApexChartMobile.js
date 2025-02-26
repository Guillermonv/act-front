import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const API_URL = "https://activity1.free.beeceptor.com/api/v3/activities";

const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("-").map(Number);
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
};

const transformData = (data) => {
  const activityNames = Object.keys(data.activities);
  const uniqueDates = [...new Set(Object.values(data.activities).flatMap((records) => records.map(({ date }) => parseDate(date))))].sort();

  return uniqueDates.map((date) => ({
    name: date,
    data: activityNames.map((activity) => {
      const record = data.activities[activity]?.find((r) => parseDate(r.date) === date);
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

        setChartData({
          series,
          options: {
            chart: {
              height: 100600,
              width: 500,
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
              title: { text: "Activities" },
              position: "top", // Mueve las actividades arriba
              labels: {
                rotate: -90, // Gira los nombres para mejor visibilidad
                style: {
                  fontSize: "14px",
                  fontWeight: 600,
                },
              },
            },
            yaxis: {
              title: { text: "Dates" },
              opposite: true, // Mueve las fechas al lado derecho
              labels: {
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
      <h2>Activity Heatmap</h2>
      <ReactApexChart options={chartData.options} series={chartData.series} type="heatmap" height={100600} width={500} />
    </div>
  );
};

export default ApexChartMobile;