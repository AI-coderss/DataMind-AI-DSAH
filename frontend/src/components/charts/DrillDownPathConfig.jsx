import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DrillDownPathConfig({ columns, onSave, initialPath = [] }) {
  const [drillPath, setDrillPath] = useState(initialPath.length > 0 ? initialPath : [
    { level: 0, field: '', label: '', chartType: 'bar' }
  ]);

  const addLevel = () => {
    setDrillPath([...drillPath, {
      level: drillPath.length,
      field: '',
      label: '',
      chartType: 'bar'
    }]);
  };

  const removeLevel = (index) => {
    setDrillPath(drillPath.filter((_, i) => i !== index));
  };

  const updateLevel = (index, field, value) => {
    const newPath = [...drillPath];
    newPath[index][field] = value;
    setDrillPath(newPath);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Drill-Down Path Configuration</Label>
        <Button size="sm" variant="outline" onClick={addLevel}>
          <Plus className="w-3 h-3 mr-1" />
          Add Level
        </Button>
      </div>

      <div className="space-y-3">
        {drillPath.map((level, index) => (
          <Card key={index} className="border-l-4 border-l-purple-500">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Field</Label>
                      <Select 
                        value={level.field} 
                        onValueChange={(v) => updateLevel(index, 'field', v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {columns.map(col => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Chart Type</Label>
                      <Select 
                        value={level.chartType} 
                        onValueChange={(v) => updateLevel(index, 'chartType', v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">Bar</SelectItem>
                          <SelectItem value="line">Line</SelectItem>
                          <SelectItem value="pie">Pie</SelectItem>
                          <SelectItem value="area">Area</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Display Label</Label>
                    <Input
                      placeholder="e.g., By Category"
                      value={level.label}
                      onChange={(e) => updateLevel(index, 'label', e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                {drillPath.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeLevel(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2 p-3 bg-accent rounded-lg text-xs">
        <ChevronRight className="w-4 h-4" />
        <span className="text-muted-foreground">
          Drill Path: {drillPath.map(l => l.label || l.field || '?').join(' → ')}
        </span>
      </div>

      <Button onClick={() => onSave(drillPath)} className="w-full">
        Save Drill-Down Path
      </Button>
    </div>
  );
}