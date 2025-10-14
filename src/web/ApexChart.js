import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import StatusModal from "../form/StatusModal";
import { FormControl, InputLabel, MenuItem, Select, Switch, FormControlLabel } from "@mui/material";

import "@fontsource/roboto";
import "@fontsource/montserrat";

const API_URL = "http://44.204.238.86:80/activities/grouped";

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
  const normalized = (status || "").toLowerCase();
  const statusMap = {
    failed: 0.2,
    regular: 0.5,
    suck: 0.001,
    accomplished: 1,
    excellence: 1.2,
  };
  return statusMap[normalized] ?? null;
};

// 🎨 Colores más visibles y equilibrados
const STATUS_COLORS = {
  suck: "#9e9e9e",         // gris medio
  failed: "#ef5350",       // rojo equilibrado
  regular: "#ffeb3b",      // amarillo visible
  accomplished: "#66bb6a", // verde equilibrado
  excellence: "#42a5f5",   // azul más visible
  noStatus: "#f5f5f5",     // gris muy claro para celdas vacías
};

const ApexChart = () => {
  const [charts, setCharts] = useState({});
  const [selectedMonth, setSelectedMonth] = useState("01");
  const [selectedCell, setSelectedCell] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showAll, setShowAll] = useState(true);

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
          const uniqueDates = Object.keys(records).sort((a, b) => new Date(a) - new Date(b));
          const activities = [...new Set(Object.values(records).flatMap(Object.keys))];

          chartConfigs[month].series = activities.map((activity) => ({
            name: activity,
            data: uniqueDates.map((date) => {
              const status = records[date]?.[activity] || "";
              return {
                x: date,
                y: mapStatusToValue(status),
                date,
                status: status || "no status",
                activity,
              };
            }),
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
    setSelectedCell({ ...clickedData, date: clickedData.date });
  };

  const handleStatusClick = (status) => {
    setSelectedStatus((prev) => (prev === status ? null : status));
  };

  const filterSeriesByStatus = (series) => {
    if (!selectedStatus) return series;
    return series.map((s) => ({
      ...s,
      data: s.data.map((d) => ({
        ...d,
        y: d.status.toLowerCase() === selectedStatus.toLowerCase() ? d.y : null,
      })),
    }));
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginTop: "1.5rem",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <div
        style={{
          width: "55%",
          padding: "1rem",
          backgroundColor: "white",
          borderRadius: "1rem",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          marginBottom: 0,
          transition: "all 0.4s ease",
        }}
      >
<div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem" }}>
  <FormControlLabel
    control={
      <Switch
        checked={showAll}
        onChange={() => setShowAll(!showAll)}
        color="primary"
      />
    }
    label={showAll ? "Hide Chart" : "Show Chart"}
  />
</div>


        {showAll && (
          <>
            <div style={{ display: "flex", width: "100%", marginBottom: 0 }}>
              <div style={{ display: "flex", marginLeft: "0%" }}>
                <FormControl variant="outlined" style={{ minWidth: 150 }}>
                  <InputLabel>Mes</InputLabel>
                  <Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    label="Mes"
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = (i + 1).toString().padStart(2, "0");
                      return (
                        <MenuItem key={month} value={month}>
                          {new Date(2024, i).toLocaleString("default", {
                            month: "long",
                          })}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </div>

              {/* 🔹 Indicadores de estado con colores más visibles */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexGrow: 1,
                  gap: "12px",
                  marginRight: "22%",
                }}
              >
                {Object.entries({
                  suck: "Suck",
                  failed: "Failed",
                  regular: "Regular",
                  accomplished: "Accomplished",
                  excellence: "Excellence",
                }).map(([key, label]) => (
                  <span
                    key={key}
                    onClick={() => handleStatusClick(key)}
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        backgroundColor: STATUS_COLORS[key],
                        border: "1px solid #aaa",
                        marginRight: 5,
                      }}
                    ></span>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {charts[selectedMonth] && (
              <ReactApexChart
                options={{
                  chart: {
                    type: "heatmap",
                    events: { dataPointSelection: handleCellClick },
                    toolbar: { show: true, tools: { download: false } },
                  },
                  plotOptions: {
                    heatmap: {
                      shadeIntensity: 0.5,
                      radius: 0,
                      colorScale: {
                        ranges: [
                          { from: 0.001, to: 0.001, name: "Suck", color: STATUS_COLORS.suck },
                          { from: 0.2, to: 0.2, name: "Failed", color: STATUS_COLORS.failed },
                          { from: 0.5, to: 0.5, name: "Regular", color: STATUS_COLORS.regular },
                          { from: 1, to: 1, name: "Accomplished", color: STATUS_COLORS.accomplished },
                          { from: 1.2, to: 1.2, name: "Excellence", color: STATUS_COLORS.excellence },
                          { from: null, to: null, name: "No Status", color: STATUS_COLORS.noStatus },
                        ],
                      },
                    },
                  },
                  legend: { show: false },
                  dataLabels: { enabled: false },
                  xaxis: {
                    type: "category",
                    labels: {
                      formatter: (val) => val.split("-")[2],
                      style: {
                        fontSize: "16px",
                        fontFamily: "Roboto, sans-serif",
                        fontWeight: 400,
                      },
                    },
                  },
                  yaxis: {
                    labels: {
                      style: {
                        fontSize: "16px",
                        fontFamily: "Roboto, sans-serif",
                        fontWeight: 400,
                      },
                    },
                  },
                }}
                series={filterSeriesByStatus(charts[selectedMonth].series)}
                type="heatmap"
                height="150%"
                width="100%"
              />
            )}

            <StatusModal
              selectedCell={selectedCell}
              setSelectedCell={setSelectedCell}
              refreshData={fetchData}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ApexChart;
