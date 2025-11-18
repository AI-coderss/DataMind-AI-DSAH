import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, Upload, FileJson } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DashboardExport({ isOpen, onClose, dashboardItems, onImport }) {
  const handleExport = () => {
    const config = {
      version: '1.0',
      exported: new Date().toISOString(),
      items: dashboardItems.map(item => ({
        title: item.title,
        description: item.description,
        chart_type: item.chart_type,
        chart_config: item.chart_config,
        order: item.order
      })),
      theme: JSON.parse(localStorage.getItem('dashboardTheme') || '{}')
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const config = JSON.parse(text);
      
      if (config.items) {
        onImport(config.items, config.theme);
        onClose();
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import configuration');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="w-5 h-5" />
            Dashboard Configuration
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label className="mb-2 block">Export Configuration</Label>
            <Button onClick={handleExport} className="w-full gap-2" disabled={dashboardItems.length === 0}>
              <Download className="w-4 h-4" />
              Download Config
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Save your dashboard layout, charts, and theme settings
            </p>
          </div>

          <div className="border-t pt-4">
            <Label className="mb-2 block">Import Configuration</Label>
            <Input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Load a previously saved dashboard configuration
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}