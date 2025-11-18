import React, { useState, useRef, useEffect } from 'react';
import EChartsWrapper from './EChartsWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Download, Maximize2, Filter, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChartBrush } from './ChartBrushManager';
import DrillDownPathConfig from './DrillDownPathConfig';
import { Badge } from '@/components/ui/badge';

export default function InteractiveChart({ 
  title, 
  description, 
  chartConfig, 
  onDrillDown,
  data,
  chartId,
  drillDownPath = []
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDrillConfig, setShowDrillConfig] = useState(false);
  const [localDrillPath, setLocalDrillPath] = useState(drillDownPath);
  const chartRef = useRef(null);
  const { selectedData, activeChartId, onBrushSelect, clearBrush } = useChartBrush();

  const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
  const isThisChartActive = activeChartId === chartId;
  const hasSelection = selectedData && !isThisChartActive;

  // Filter data based on brush selection from other charts
  const filteredChartConfig = React.useMemo(() => {
    if (!hasSelection || !data) return chartConfig;

    const filtered = data.filter(item => {
      return selectedData.some(selected => {
        return Object.keys(selected).every(key => item[key] === selected[key]);
      });
    });

    // Update chart config with filtered data
    const config = { ...chartConfig };
    if (config.series) {
      config.series = config.series.map(s => ({
        ...s,
        data: filtered.length > 0 ? filtered : data
      }));
    }

    return config;
  }, [hasSelection, selectedData, data, chartConfig]);

  // Enhanced chart config with brush and tooltip
  const enhancedConfig = React.useMemo(() => {
    const config = { ...filteredChartConfig };
    
    // Add brush component for selection
    if (!config.brush) {
      config.brush = {
        toolbox: ['rect', 'clear'],
        xAxisIndex: 0,
        brushStyle: {
          borderWidth: 2,
          color: 'rgba(99, 102, 241, 0.2)',
          borderColor: 'rgba(99, 102, 241, 0.8)'
        }
      };
    }

    // Add toolbox for brush
    if (!config.toolbox) {
      config.toolbox = {
        feature: {
          brush: {
            type: ['rect', 'clear']
          }
        },
        right: 60
      };
    }

    // Enhanced tooltip with more fields
    if (!config.tooltip || typeof config.tooltip !== 'object') {
      config.tooltip = {};
    }
    
    config.tooltip = {
      ...config.tooltip,
      trigger: 'item',
      appendToBody: true,
      formatter: (params) => {
        if (!params.data) return '';
        
        const dataItem = params.data;
        let html = `<div style="padding: 8px;">`;
        html += `<div style="font-weight: bold; margin-bottom: 6px;">${params.name || params.seriesName}</div>`;
        
        // Show all available fields
        if (typeof dataItem === 'object') {
          Object.keys(dataItem).forEach(key => {
            if (key !== 'name' && dataItem[key] !== undefined) {
              html += `<div style="margin: 4px 0;"><span style="color: #999;">${key}:</span> <span style="font-weight: 500;">${dataItem[key]}</span></div>`;
            }
          });
        } else {
          html += `<div style="margin: 4px 0;"><span style="font-weight: 500;">${dataItem}</span></div>`;
        }
        
        html += `</div>`;
        return html;
      }
    };

    // Highlight if filtered
    if (hasSelection && config.series) {
      config.series = config.series.map(s => ({
        ...s,
        emphasis: {
          focus: 'series',
          blurScope: 'coordinateSystem'
        }
      }));
    }

    return config;
  }, [filteredChartConfig, hasSelection]);

  const handleChartClick = (params) => {
    if (localDrillPath.length > 0 && onDrillDown) {
      onDrillDown({
        ...params,
        drillPath: localDrillPath,
        sourceData: data
      });
    }
  };

  const handleBrushEnd = (params) => {
    if (!params.areas || params.areas.length === 0) {
      if (isThisChartActive) {
        clearBrush();
      }
      return;
    }

    const brushArea = params.areas[0];
    const selected = [];

    // Extract selected data points
    if (data && brushArea.coordRange) {
      const [xStart, xEnd] = brushArea.coordRange;
      data.forEach((item, index) => {
        if (index >= xStart && index <= xEnd) {
          selected.push(item);
        }
      });
    }

    if (selected.length > 0) {
      onBrushSelect(chartId, selected);
    }
  };

  const exportChart = () => {
    if (chartRef.current && window.echarts) {
      const chartInstance = window.echarts.getInstanceByDom(chartRef.current);
      if (chartInstance) {
        const url = chartInstance.getDataURL({
          type: 'png',
          pixelRatio: 2,
          backgroundColor: '#fff'
        });
        const link = document.createElement('a');
        link.download = `${title}.png`;
        link.href = url;
        link.click();
      }
    }
  };

  const ChartView = ({ height = '350px' }) => (
    <div ref={chartRef}>
      <EChartsWrapper
        option={enhancedConfig}
        style={{ width: '100%', height }}
        onClick={handleChartClick}
        onBrushEnd={handleBrushEnd}
      />
    </div>
  );

  return (
    <>
      <Card className="group relative">
        {hasSelection && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="secondary" className="text-xs">
              <Filter className="w-3 h-3 mr-1" />
              Filtered
            </Badge>
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm md:text-base">{title}</CardTitle>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
              {localDrillPath.length > 0 && (
                <Badge variant="outline" className="text-xs mt-2">
                  {localDrillPath.length} level drill-down
                </Badge>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={exportChart}
              >
                <Download className="w-3 h-3" />
              </Button>
              <Dialog open={showDrillConfig} onOpenChange={setShowDrillConfig}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                    <MessageSquare className="w-3 h-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Configure Drill-Down Path</DialogTitle>
                  </DialogHeader>
                  <DrillDownPathConfig
                    columns={columns}
                    initialPath={localDrillPath}
                    onSave={(path) => {
                      setLocalDrillPath(path);
                      setShowDrillConfig(false);
                    }}
                  />
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => setIsFullscreen(true)}
              >
                <Maximize2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartView />
        </CardContent>
      </Card>

      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-6xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1">
            <ChartView height="calc(80vh - 100px)" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}