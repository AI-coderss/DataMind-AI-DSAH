import React, { useEffect, useRef } from 'react';

export default function EChartsWrapper({ option, style, onClick, onBrushEnd }) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    const loadECharts = async () => {
      if (!window.echarts) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
        script.async = true;
        document.head.appendChild(script);
        await new Promise(resolve => {
          script.onload = resolve;
        });
      }

      if (chartRef.current && window.echarts) {
        if (!chartInstanceRef.current) {
          chartInstanceRef.current = window.echarts.init(chartRef.current);
          
          if (onClick) {
            chartInstanceRef.current.on('click', onClick);
          }
          
          if (onBrushEnd) {
            chartInstanceRef.current.on('brushEnd', onBrushEnd);
          }
        }

        chartInstanceRef.current.setOption(option, true);

        const handleResize = () => {
          chartInstanceRef.current?.resize();
        };
        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }
    };

    loadECharts();

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [option, onClick, onBrushEnd]);

  return <div ref={chartRef} style={style} />;
}