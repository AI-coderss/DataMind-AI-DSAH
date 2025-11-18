import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout, Save } from 'lucide-react';

export default function LayoutCustomizer({ isOpen, onClose, onSave }) {
  const [layoutConfig, setLayoutConfig] = useState({
    kpiColumns: 4,
    chartColumns: 2,
    spacing: 'normal'
  });

  const handleSave = () => {
    localStorage.setItem('dashboardLayout', JSON.stringify(layoutConfig));
    onSave(layoutConfig);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Customize Layout
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>KPI Cards per Row</Label>
            <Select 
              value={layoutConfig.kpiColumns.toString()} 
              onValueChange={(v) => setLayoutConfig({...layoutConfig, kpiColumns: parseInt(v)})}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 columns</SelectItem>
                <SelectItem value="3">3 columns</SelectItem>
                <SelectItem value="4">4 columns</SelectItem>
                <SelectItem value="5">5 columns</SelectItem>
                <SelectItem value="6">6 columns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Chart Columns</Label>
            <Select 
              value={layoutConfig.chartColumns.toString()} 
              onValueChange={(v) => setLayoutConfig({...layoutConfig, chartColumns: parseInt(v)})}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 column</SelectItem>
                <SelectItem value="2">2 columns</SelectItem>
                <SelectItem value="3">3 columns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Spacing</Label>
            <Select 
              value={layoutConfig.spacing} 
              onValueChange={(v) => setLayoutConfig({...layoutConfig, spacing: v})}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 gap-2">
              <Save className="w-4 h-4" />
              Apply Layout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}