import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import "@fontsource/inter";
import "@fontsource/roboto";
import "@fontsource/poppins";

const API_URL = "https://blockchainprovider.free.beeceptor.com/api/v3/activities";

const parseDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return null;
  const [day, month] = dateStr.split("-").map(Number);
  if (!day || !month) return null;
  return `${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
};

const formatDateForYAxis = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return "";
  const [month, day] = dateStr.split("-");
  return month && day ? `${month}-${day}` : "";
};

const transformData = (data) => {
  console.log("API response:", data);

  if (!data || !data.activities) return [];

  const activityNames = Object.keys(data.activities);
  const uniqueDates = [...new Set(
    Object.values(data.activities)
      .flatMap((records) => records.map(({ date }) => parseDate(date)))
      .filter(Boolean)
  )].sort();

  return uniqueDates.map((date) => ({
    name: date,
    data: activityNames
      .map((activity) => {
        const records = data.activities[activity] || [];
        const record = records.find((r) => parseDate(r.date) === date);

        if (!record) return null;

        let yValue = null;
        if (record.status === "accomplished") yValue = 1;
        else if (record.status === "suck") yValue = 0;
        else if (record.status === "regular") yValue = 0.5;
        else if (record.status === "failed") yValue = 0.2;
        else if (record.status === "excellence") yValue = 1.2;

        return yValue !== null ? { x: activity, y: yValue } : null;
      })
      .filter(Boolean),
  })).filter((series) => series.data.length > 0);
};

const ApexChartMobile = () => {
  const [chartData, setChartData] = useState({ series: [], options: {} });

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const series = transformData(data);
        console.log("Series final:", series);

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
                    { from: 0, to: 0, name: "Suck", color: "#000000" },
                    { from: 0.2, to: 0.2, name: "Failed", color: "#FF0000" },
                    { from: 0.5, to: 0.5, name: "Regular", color: "#FFFF00" },
                    { from: 1, to: 1, name: "Accomplished", color: "#00A100" },
                    { from: 1.2, to: 1.2, name: "Excellence", color: "#0000FF" },
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
                  fontFamily: "Poppins, sans-serif",
                },
              },
            },
            yaxis: {
              title: { text: "Dates", style: { fontFamily: "Roboto, sans-serif" } },
              opposite: false,
              labels: {
                formatter: (value) => {
                  console.log("y-axis value:", value);
                  return formatDateForYAxis(value);
                },
                style: {
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
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
