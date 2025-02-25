import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import ApexChart from "./ApexChart"; // Versión para escritorio
import ApexChartMobile from "./ApexChartMobile"; // Versión para móvil
import reportWebVitals from "./reportWebVitals";

const ResponsiveChart = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <ApexChartMobile /> : <ApexChart />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ResponsiveChart />
  </React.StrictMode>
);

reportWebVitals();
