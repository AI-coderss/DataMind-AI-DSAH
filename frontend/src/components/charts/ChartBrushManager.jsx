import React, { createContext, useContext, useState } from 'react';

const ChartBrushContext = createContext();

export function ChartBrushProvider({ children }) {
  const [selectedData, setSelectedData] = useState(null);
  const [activeChartId, setActiveChartId] = useState(null);

  const onBrushSelect = (chartId, data) => {
    setActiveChartId(chartId);
    setSelectedData(data);
  };

  const clearBrush = () => {
    setActiveChartId(null);
    setSelectedData(null);
  };

  return (
    <ChartBrushContext.Provider value={{ selectedData, activeChartId, onBrushSelect, clearBrush }}>
      {children}
    </ChartBrushContext.Provider>
  );
}

export function useChartBrush() {
  const context = useContext(ChartBrushContext);
  if (!context) {
    throw new Error('useChartBrush must be used within ChartBrushProvider');
  }
  return context;
}