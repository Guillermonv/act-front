import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import ApexChart from "./web/ApexChart"; 
import ApexChartMobile from "./mobile/ApexChartMobile"; 
import WeightChartDesktop from "./web/WeightChart"; // 👈
import TodoChartDesktop from "./web/TodoTask"; // 👈

import WeightChartMobile from "./mobile/WeightChart"; 

import reportWebVitals from "./reportWebVitals";

const isMobileDevice = () => {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
};

const ResponsiveApexChart = () => {
  const [isMobile, setIsMobile] = useState(isMobileDevice());

  useEffect(() => {
    const handleResize = () => setIsMobile(isMobileDevice());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <ApexChartMobile /> : <ApexChart />;
};

const ResponsiveWeightChart = () => {
  const [isMobile, setIsMobile] = useState(isMobileDevice());

  useEffect(() => {
    const handleResize = () => setIsMobile(isMobileDevice());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <WeightChartMobile /> : <WeightChartDesktop />;
};

const ResponsiveTodoChart = () => {
  const [isMobile, setIsMobile] = useState(isMobileDevice());

  useEffect(() => {
    const handleResize = () => setIsMobile(isMobileDevice());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <TodoChartDesktop /> : <TodoChartDesktop />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ResponsiveWeightChart />
    <ResponsiveApexChart />
    <ResponsiveTodoChart />
  </React.StrictMode>
);

reportWebVitals();
