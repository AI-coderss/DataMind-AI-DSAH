import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import EChartsWrapper from '../charts/EChartsWrapper';

export default function DrillDownModal({ isOpen, onClose, drillData }) {
  const [drillStack, setDrillStack] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(0);

  React.useEffect(() => {
    if (drillData && isOpen) {
      setDrillStack([{
        level: 0,
        data: drillData,
        path: drillData.drillPath?.[0]
      }]);
      setCurrentLevel(0);
    }
  }, [drillData, isOpen]);

  if (!drillData) return null;

  const currentDrill = drillStack[currentLevel];
  const hasPath = drillData.drillPath && drillData.drillPath.length > 0;
  const canDrillDeeper = hasPath && currentLevel < drillData.drillPath.length - 1;

  const handleDrillDown = (params) => {
    if (!canDrillDeeper || !drillData.sourceData) return;

    const nextPath = drillData.drillPath[currentLevel + 1];
    const clickedValue = params.name || params.data?.name;

    // Filter data for next level
    const filteredData = drillData.sourceData.filter(item => {
      return item[currentDrill.path.field] === clickedValue;
    });

    // Generate chart for next level
    const nextLevelData = generateDrillChart(filteredData, nextPath);

    setDrillStack([...drillStack, {
      level: currentLevel + 1,
      data: { ...params, chartConfig: nextLevelData },
      path: nextPath,
      filter: { field: currentDrill.path.field, value: clickedValue }
    }]);
    setCurrentLevel(currentLevel + 1);
  };

  const handleBack = () => {
    if (currentLevel > 0) {
      setCurrentLevel(currentLevel - 1);
      setDrillStack(drillStack.slice(0, -1));
    }
  };

  const generateDrillChart = (data, path) => {
    if (!data || data.length === 0 || !path.field) return null;

    // Aggregate data by the field
    const aggregated = {};
    data.forEach(item => {
      const key = item[path.field];
      if (key) {
        aggregated[key] = (aggregated[key] || 0) + 1;
      }
    });

    const chartData = Object.entries(aggregated).map(([name, value]) => ({
      name,
      value
    }));

    // Generate chart config based on type
    const baseConfig = {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      grid: { left: 50, right: 50, bottom: 60, top: 40 }
    };

    if (path.chartType === 'pie') {
      return {
        ...baseConfig,
        series: [{
          type: 'pie',
          radius: '60%',
          data: chartData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };
    } else {
      return {
        ...baseConfig,
        xAxis: {
          type: 'category',
          data: chartData.map(d => d.name)
        },
        yAxis: { type: 'value' },
        series: [{
          type: path.chartType || 'bar',
          data: chartData.map(d => d.value),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: '#667eea' },
                { offset: 1, color: '#764ba2' }
              ]
            }
          }
        }]
      };
    }
  };

  const displayChart = currentDrill?.data?.chartConfig || 
    (currentDrill?.data && generateDrillChart(drillData.sourceData, currentDrill.path));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {currentDrill?.path?.label || 'Drill-Down Analysis'}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {currentLevel > 0 && (
                <Button size="sm" variant="outline" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
              <Badge variant="secondary">
                Level {currentLevel + 1} {hasPath ? `/ ${drillData.drillPath.length}` : ''}
              </Badge>
            </div>
          </div>
          {currentDrill?.filter && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <span>Filter:</span>
              <Badge variant="outline">
                {currentDrill.filter.field} = {currentDrill.filter.value}
              </Badge>
            </div>
          )}
        </DialogHeader>

        <div className="mt-4">
          {hasPath && currentDrill?.path && (
            <div className="mb-4 p-3 bg-accent rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                {drillData.drillPath.map((path, idx) => (
                  <React.Fragment key={idx}>
                    <Badge 
                      variant={idx === currentLevel ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (idx < currentLevel) {
                          setCurrentLevel(idx);
                          setDrillStack(drillStack.slice(0, idx + 1));
                        }
                      }}
                    >
                      {path.label || path.field}
                    </Badge>
                    {idx < drillData.drillPath.length - 1 && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {displayChart ? (
            <div className="border rounded-lg p-4 bg-card">
              <EChartsWrapper
                option={displayChart}
                style={{ width: '100%', height: '400px' }}
                onClick={canDrillDeeper ? handleDrillDown : undefined}
              />
              {canDrillDeeper && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Click on any data point to drill down further
                </p>
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Clicked Value: {drillData.name || drillData.data?.name || 'N/A'}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4 max-w-md mx-auto">
                {drillData.data && typeof drillData.data === 'object' && 
                  Object.entries(drillData.data).map(([key, value]) => (
                    <div key={key} className="p-3 bg-accent rounded-lg">
                      <p className="text-xs text-muted-foreground">{key}</p>
                      <p className="text-sm font-semibold">{value}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}