import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  ScatterChart,
  AreaChart,
  TrendingUp,
  Radar,
  Gauge,
  CreditCard,
  Activity
} from 'lucide-react';

const CHART_TYPES = [
  { type: 'kpi', label: 'KPI Card', icon: CreditCard, category: 'cards' },
  { type: 'metric', label: 'Metric', icon: Activity, category: 'cards' },
  { type: 'bar', label: 'Bar', icon: BarChart3, category: 'charts' },
  { type: 'line', label: 'Line', icon: LineChart, category: 'charts' },
  { type: 'pie', label: 'Pie', icon: PieChart, category: 'charts' },
  { type: 'scatter', label: 'Scatter', icon: ScatterChart, category: 'charts' },
  { type: 'area', label: 'Area', icon: AreaChart, category: 'charts' },
  { type: 'heatmap', label: 'Heatmap', icon: TrendingUp, category: 'charts' },
  { type: 'radar', label: 'Radar', icon: Radar, category: 'charts' },
  { type: 'gauge', label: 'Gauge', icon: Gauge, category: 'charts' },
];

export default function ChartTypeSelector({ selected, onChange }) {
  const cardTypes = CHART_TYPES.filter(t => t.category === 'cards');
  const chartTypes = CHART_TYPES.filter(t => t.category === 'charts');

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">KPI Cards</h4>
        <div className="grid grid-cols-2 gap-2">
          {cardTypes.map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant={selected === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange(type)}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-muted-foreground mb-2">Charts</h4>
        <div className="grid grid-cols-4 gap-2">
          {chartTypes.map(({ type, label, icon: Icon }) => (
            <Button
              key={type}
              variant={selected === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => onChange(type)}
              className="flex flex-col gap-1 h-auto py-3"
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}