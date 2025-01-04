import React from 'react';
import { Settings } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface ConversionSettings {
  fps: number;
  quality: number;
  width: number;
}

interface ConversionSettingsProps {
  settings: ConversionSettings;
  onSettingsChange: (settings: ConversionSettings) => void;
}

const ConversionSettings = ({ settings, onSettingsChange }: ConversionSettingsProps) => {
  return (
    <div className="space-y-6 bg-card p-6">
      <div className="flex items-center gap-2">
        <Settings className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Conversion Settings</h2>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Frame Rate (FPS)</label>
          <div className="px-1">
            <Slider
              value={[settings.fps]}
              onValueChange={(value) => onSettingsChange({ ...settings, fps: value[0] })}
              min={5}
              max={60}
              step={5}
              className="py-4"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>5 FPS</span>
            <span className="font-mono">{settings.fps} FPS</span>
            <span>60 FPS</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Quality</label>
          <div className="px-1">
            <Slider
              value={[settings.quality]}
              onValueChange={(value) => onSettingsChange({ ...settings, quality: value[0] })}
              min={10}
              max={100}
              step={10}
              className="py-4"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>10%</span>
            <span className="font-mono">{settings.quality}%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Width (px)</label>
          <Input
            type="number"
            value={settings.width}
            onChange={(e) => onSettingsChange({ ...settings, width: parseInt(e.target.value) || 0 })}
            min={100}
            max={1920}
            step={10}
            className="font-mono bg-secondary border-secondary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Min: 100px</span>
            <span>Max: 1920px</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionSettings;