import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import ApexChart from "./ApexChart"; // Versión para escritorio
import ApexChartMobile from "./ApexChartMobile"; // Versión para móvil
import WeightChart from "./mobile/WeightChart"; // 💡 Importamos el nuevo line chart
import reportWebVitals from "./reportWebVitals";

const isMobileDevice = () => {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
};

const ResponsiveChart = () => {
  const [isMobile, setIsMobile] = useState(isMobileDevice());

  useEffect(() => {
    const handleResize = () => setIsMobile(isMobileDevice());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <ApexChartMobile /> : <ApexChart />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
        <WeightChart /> 
    <ResponsiveChart />
  </React.StrictMode>
);

reportWebVitals();