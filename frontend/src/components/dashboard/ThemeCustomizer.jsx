import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Palette, Save } from 'lucide-react';

export default function ThemeCustomizer({ isOpen, onClose, onSave }) {
  const [colors, setColors] = useState({
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    background: '#ffffff'
  });

  const handleSave = () => {
    const root = document.documentElement;
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--accent', colors.accent);
    localStorage.setItem('dashboardTheme', JSON.stringify(colors));
    onSave(colors);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Customize Theme
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>Primary Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={colors.primary}
                onChange={(e) => setColors({...colors, primary: e.target.value})}
                className="w-20 h-10"
              />
              <Input
                value={colors.primary}
                onChange={(e) => setColors({...colors, primary: e.target.value})}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Secondary Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={colors.secondary}
                onChange={(e) => setColors({...colors, secondary: e.target.value})}
                className="w-20 h-10"
              />
              <Input
                value={colors.secondary}
                onChange={(e) => setColors({...colors, secondary: e.target.value})}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label>Accent Color</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={colors.accent}
                onChange={(e) => setColors({...colors, accent: e.target.value})}
                className="w-20 h-10"
              />
              <Input
                value={colors.accent}
                onChange={(e) => setColors({...colors, accent: e.target.value})}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 gap-2">
              <Save className="w-4 h-4" />
              Apply Theme
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}