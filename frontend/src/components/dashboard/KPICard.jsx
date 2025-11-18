import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function KPICard({ item, onDelete }) {
  const isKPI = item.chart_config?.type === 'kpi';
  const isMetric = item.chart_config?.type === 'metric';
  
  if (!isKPI && !isMetric) return null;

  const data = item.chart_config?.data || {};
  const trend = data.trend;
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <Card className="glass-effect border-border/50 relative group hover:shadow-lg transition-all">
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-6 w-6 p-0"
        onClick={() => onDelete(item.id)}
      >
        <Trash2 className="w-3 h-3 text-destructive" />
      </Button>
      <CardContent className="pt-4 pb-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">{item.title}</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-2xl md:text-3xl font-bold">{data.value}</p>
            {trend && (
              <TrendIcon className={`w-4 h-4 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
            )}
          </div>
          {data.label && (
            <p className="text-xs text-muted-foreground mt-1">{data.label}</p>
          )}
          {data.change && (
            <Badge 
              className="mt-2" 
              variant={trend === 'up' ? 'default' : 'destructive'}
            >
              {data.change}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}