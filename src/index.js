import React, { useState, useEffect, createContext, useContext } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import ApexChart from "./web/ApexChart"; 
import ApexChartMobile from "./mobile/ApexChartMobile"; 
import WeightChartDesktop from "./web/WeightChart"; 
import TodoChartDesktop from "./web/TodoTask"; 
import WeightChartMobile from "./mobile/WeightChart"; 

import reportWebVitals from "./reportWebVitals";

// ------------------- Theme Context -------------------
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "day");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === "day" ? "night" : "day"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// ------------------- Helper -------------------
const isMobileDevice = () => /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;

// ------------------- Responsive Components -------------------
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

const ResponsiveTodoChart = () => <TodoChartDesktop />;

// ------------------- Theme Toggle Button -------------------
const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <button
      onClick={toggleTheme}
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        padding: "8px 12px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        background: theme === "day" ? "#333" : "#fff",
        color: theme === "day" ? "#fff" : "#000",
        zIndex: 1000
      }}
    >
      {theme === "day" ? "Night Mode" : "Day Mode"}
    </button>
  );
};

// ------------------- App -------------------
const App = () => {
  return (
    <>
      <ThemeToggleButton />
      <ResponsiveWeightChart />
      <ResponsiveApexChart />
      <ResponsiveTodoChart />
    </>
  );
};

// ------------------- Render -------------------
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

reportWebVitals();
