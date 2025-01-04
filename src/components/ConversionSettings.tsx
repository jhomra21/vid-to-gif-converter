import React from 'react';
import { Cog, HelpCircle } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConversionSettings {
  fps: number;
  width: number;
  dither: boolean;
  optimizePalette: boolean;
  ditherStrength: number;
  loop: number;
  compression: number;
  preserveAlpha: boolean;
}

interface ConversionSettingsProps {
  settings: ConversionSettings;
  onSettingsChange: (settings: ConversionSettings) => void;
}

const ConversionSettings = ({ settings, onSettingsChange }: ConversionSettingsProps) => {
  const handlePresetClick = (preset: 'high' | 'balanced' | 'small') => {
    switch (preset) {
      case 'high':
        onSettingsChange({
          ...settings,
          fps: 30,
          width: 800,
          dither: true,
          ditherStrength: 3,
          optimizePalette: true,
          compression: 3,
          preserveAlpha: true,
        });
        break;
      case 'balanced':
        onSettingsChange({
          ...settings,
          fps: 15,
          width: 400,
          dither: true,
          ditherStrength: 2,
          optimizePalette: true,
          compression: 6,
          preserveAlpha: false,
        });
        break;
      case 'small':
        onSettingsChange({
          ...settings,
          fps: 10,
          width: 320,
          dither: false,
          ditherStrength: 0,
          optimizePalette: true,
          compression: 9,
          preserveAlpha: false,
        });
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Cog className="w-4 h-4" />
          <h2 className="text-lg font-medium">Settings</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={settings.fps === 30 && settings.width === 800 ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick('high')}
            className="text-xs"
          >
            High Quality
          </Button>
          <Button
            variant={settings.fps === 15 && settings.width === 400 ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick('balanced')}
            className="text-xs"
          >
            Balanced
          </Button>
          <Button
            variant={settings.fps === 10 && settings.width === 320 ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick('small')}
            className="text-xs"
          >
            Small Size
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Frame Rate (FPS)</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">Higher FPS results in smoother animation but larger file size</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="text-sm font-mono">{settings.fps} FPS</span>
        </div>
        <Slider
          value={[settings.fps]}
          onValueChange={([fps]) => onSettingsChange({ ...settings, fps })}
          min={5}
          max={60}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5 FPS</span>
          <span>60 FPS</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Compression</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">Higher compression reduces file size but may affect quality</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="text-sm font-mono">{settings.compression}x</span>
        </div>
        <Slider
          value={[settings.compression]}
          onValueChange={([compression]) => onSettingsChange({ ...settings, compression })}
          min={1}
          max={9}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Width (px)</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">Height will adjust automatically to maintain aspect ratio</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="text-sm font-mono">{settings.width}px</span>
        </div>
        <Input
          type="number"
          value={settings.width}
          onChange={(e) => {
            const width = Math.max(100, Math.min(1920, parseInt(e.target.value) || 100));
            onSettingsChange({ ...settings, width });
          }}
          className="font-mono"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Min: 100px</span>
          <span>Max: 1920px</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Loop Count</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">0 means infinite loop, or specify number of times to loop</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="text-sm font-mono">{settings.loop === 0 ? '∞' : settings.loop}</span>
        </div>
        <Input
          type="number"
          value={settings.loop}
          onChange={(e) => {
            const loop = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
            onSettingsChange({ ...settings, loop });
          }}
          className="font-mono"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 = Infinite</span>
          <span>Max: 100</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Enable Dithering</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">Dithering can improve color transitions in GIFs</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            checked={settings.dither}
            onCheckedChange={(dither) => onSettingsChange({ ...settings, dither })}
          />
        </div>

        {settings.dither && (
          <div className="space-y-4 pl-6 border-l-2 border-muted">
            <div className="flex items-center justify-between">
              <span>Dither Strength</span>
              <span className="text-sm font-mono">{settings.ditherStrength}</span>
            </div>
            <Slider
              value={[settings.ditherStrength]}
              onValueChange={([ditherStrength]) => onSettingsChange({ ...settings, ditherStrength })}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtle</span>
              <span>Strong</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Optimize Color Palette</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">Generates an optimal color palette for better quality</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            checked={settings.optimizePalette}
            onCheckedChange={(optimizePalette) => onSettingsChange({ ...settings, optimizePalette })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Preserve Transparency</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-[200px] text-xs">Maintain transparency in the output GIF</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Switch
            checked={settings.preserveAlpha}
            onCheckedChange={(preserveAlpha) => onSettingsChange({ ...settings, preserveAlpha })}
          />
        </div>
      </div>
    </div>
  );
};

export default ConversionSettings;