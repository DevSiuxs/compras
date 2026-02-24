"use client"; // Si estás en Next.js con carpeta /app

import React, { useEffect, useState } from "react";

const incrementSeconds = 10;

const formatTime = (ms: number) => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
};

const Cronometro: React.FC = () => {
  const [accumulatedTime, setAccumulatedTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Cargar tiempo acumulado desde localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("accumulatedTime");
      if (stored) {
        setAccumulatedTime(parseInt(stored));
      }
    }
  }, []);

  // Actualizar reloj en tiempo real
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("es-MX"));
    };

    const interval = setInterval(updateClock, 1000);
    updateClock();

    return () => clearInterval(interval);
  }, []);

  // Guardar en localStorage y sincronizar entre pestañas
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("accumulatedTime", accumulatedTime.toString());

      const syncAcrossTabs = (e: StorageEvent) => {
        if (e.key === "accumulatedTime") {
          setAccumulatedTime(parseInt(e.newValue || "0"));
        }
      };

      window.addEventListener("storage", syncAcrossTabs);
      return () => window.removeEventListener("storage", syncAcrossTabs);
    }
  }, [accumulatedTime]);

  // Incrementar tiempo al hacer clic
  const handleClick = () => {
    setAccumulatedTime((prev) => prev + incrementSeconds * 1000);
  };

  return (
    <div onClick={handleClick} style={{ cursor: "pointer", textAlign: "center" }}>
      <div>🕒 {currentTime}</div>
      <div>⏱️ {formatTime(accumulatedTime)}</div>
    </div>
  );
};

export default Cronometro;

