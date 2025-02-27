import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

const API_URL = "https://activity1.free.beeceptor.com/api/v3/activities";

const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("-").map(Number);
  return { year, month, day, formatted: `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}` };
};

const getQuarter = (month) => {
  if (month >= 1 && month <= 3) return 1;
  if (month >= 4 && month <= 6) return 2;
  if (month >= 7 && month <= 9) return 3;
  return 4;
};

const transformData = (data, selectedQuarter) => {
  const activityNames = Object.keys(data.activities);
  const uniqueDates = [];
  const filteredData = [];

  activityNames.forEach((activity) => {
    data.activities[activity].forEach((record) => {
      const { year, month, formatted } = parseDate(record.date);
      if (getQuarter(month) === selectedQuarter) {
        if (!uniqueDates.includes(formatted)) uniqueDates.push(formatted);
        filteredData.push({ activity, date: formatted, status: record.status });
      }
    });
  });
  
  uniqueDates.sort();

  return uniqueDates.map((date) => ({
    name: date,
    data: activityNames.map((activity) => {
      const record = filteredData.find((r) => r.activity === activity && r.date === date);
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
  const [selectedQuarter, setSelectedQuarter] = useState(1);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        const series = transformData(data, selectedQuarter);

        setChartData({
          series,
          options: {
            chart: { height: 600, width: 500, type: "heatmap" },
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
            dataLabels: { enabled: false },
            title: { text: `Activity HeatMap - Q${selectedQuarter}` },
            xaxis: {
              type: "category",
              title: { text: "Activities" },
              labels: { rotate: -90 },
            },
            yaxis: {
              title: { text: "Dates" },
              opposite: true,
              labels: { style: { fontSize: "14px", fontWeight: 600 } },
            },
          },
        });
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [selectedQuarter]);

  return (
    <div>
      <h2>Activity Heatmap</h2>
      <label>Select Quarter:</label>
      <select onChange={(e) => setSelectedQuarter(Number(e.target.value))} value={selectedQuarter}>
        <option value={1}>Q1 (Jan-Mar)</option>
        <option value={2}>Q2 (Apr-Jun)</option>
        <option value={3}>Q3 (Jul-Sep)</option>
        <option value={4}>Q4 (Oct-Dec)</option>
      </select>
      <ReactApexChart options={chartData.options} series={chartData.series} type="heatmap" height={600} width={500} />
    </div>
  );
};

export default ApexChartMobile;