import React from 'react';
import { Settings, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
  return (
    <div className="bg-[#FAFAFA] border border-zinc-200 font-mono">
      <div className="flex items-center gap-3 p-4 border-b border-zinc-200 bg-white">
        <Settings className="w-5 h-5 text-zinc-600" />
        <h2 className="text-xl font-semibold text-zinc-900">Conversion Settings</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200">
        <div className="p-6 space-y-8">
          {/* Frame Rate Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-zinc-600">Frame Rate (FPS)</Label>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    <Info className="w-4 h-4 text-zinc-400" />
                  </TooltipTrigger>
                  <TooltipContent className="border-0 bg-zinc-900 text-white">
                    <p className="w-[200px] text-xs">Higher FPS results in smoother animation but larger file size</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-bold text-zinc-900">{settings.fps} FPS</span>
            </div>
            <Slider
              value={[settings.fps]}
              onValueChange={(value) => onSettingsChange({ ...settings, fps: value[0] })}
              min={5}
              max={60}
              step={5}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>5 FPS</span>
              <span>60 FPS</span>
            </div>
          </div>

          {/* Compression Level */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-zinc-600">Compression</Label>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    <Info className="w-4 h-4 text-zinc-400" />
                  </TooltipTrigger>
                  <TooltipContent className="border-0 bg-zinc-900 text-white">
                    <p className="w-[200px] text-xs">Higher compression reduces file size but may affect quality</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-bold text-zinc-900">{settings.compression}x</span>
            </div>
            <Slider
              value={[settings.compression]}
              onValueChange={(value) => onSettingsChange({ ...settings, compression: value[0] })}
              min={1}
              max={9}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8 bg-[#FCFCFC]">
          {/* Width Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-zinc-600">Width (px)</Label>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    <Info className="w-4 h-4 text-zinc-400" />
                  </TooltipTrigger>
                  <TooltipContent className="border-0 bg-zinc-900 text-white">
                    <p className="w-[200px] text-xs">Height will adjust automatically to maintain aspect ratio</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <Input
              type="number"
              value={settings.width}
              onChange={(e) => onSettingsChange({ ...settings, width: parseInt(e.target.value) || 0 })}
              min={100}
              max={1920}
              step={10}
              className="font-mono bg-white border-zinc-200 text-zinc-900 rounded-none h-10"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Min: 100px</span>
              <span>Max: 1920px</span>
            </div>
          </div>

          {/* Loop Count */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-zinc-600">Loop Count</Label>
                <Tooltip>
                  <TooltipTrigger className="cursor-help">
                    <Info className="w-4 h-4 text-zinc-400" />
                  </TooltipTrigger>
                  <TooltipContent className="border-0 bg-zinc-900 text-white">
                    <p className="w-[200px] text-xs">0 means infinite loop, or specify number of times to loop</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <Input
              type="number"
              value={settings.loop}
              onChange={(e) => onSettingsChange({ ...settings, loop: parseInt(e.target.value) || 0 })}
              min={0}
              max={100}
              className="font-mono bg-white border-zinc-200 text-zinc-900 rounded-none h-10"
            />
            <div className="flex justify-between text-xs text-zinc-500">
              <span>0 = Infinite</span>
              <span>Max: 100</span>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="space-y-6 pt-2">
            <div className="border-b border-zinc-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="dither" className="text-sm text-zinc-600">Enable Dithering</Label>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      <Info className="w-4 h-4 text-zinc-400" />
                    </TooltipTrigger>
                    <TooltipContent className="border-0 bg-zinc-900 text-white">
                      <p className="w-[200px] text-xs">Dithering can improve color transitions in GIFs</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  id="dither"
                  checked={settings.dither}
                  onCheckedChange={(checked) => onSettingsChange({ ...settings, dither: checked })}
                  className="data-[state=checked]:bg-zinc-900"
                />
              </div>

              {settings.dither && (
                <div className="mt-4 space-y-4 pl-4 border-l-2 border-zinc-200">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-zinc-600">Dither Strength</Label>
                    <span className="text-sm font-bold text-zinc-900">{settings.ditherStrength}</span>
                  </div>
                  <Slider
                    value={[settings.ditherStrength]}
                    onValueChange={(value) => onSettingsChange({ ...settings, ditherStrength: value[0] })}
                    min={1}
                    max={10}
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Subtle</span>
                    <span>Strong</span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-b border-zinc-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="optimize" className="text-sm text-zinc-600">Optimize Color Palette</Label>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      <Info className="w-4 h-4 text-zinc-400" />
                    </TooltipTrigger>
                    <TooltipContent className="border-0 bg-zinc-900 text-white">
                      <p className="w-[200px] text-xs">Generates an optimal color palette for better quality</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  id="optimize"
                  checked={settings.optimizePalette}
                  onCheckedChange={(checked) => onSettingsChange({ ...settings, optimizePalette: checked })}
                  className="data-[state=checked]:bg-zinc-900"
                />
              </div>
            </div>

            <div className="border-b border-zinc-200 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="alpha" className="text-sm text-zinc-600">Preserve Transparency</Label>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      <Info className="w-4 h-4 text-zinc-400" />
                    </TooltipTrigger>
                    <TooltipContent className="border-0 bg-zinc-900 text-white">
                      <p className="w-[200px] text-xs">Maintain transparency in the output GIF</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch
                  id="alpha"
                  checked={settings.preserveAlpha}
                  onCheckedChange={(checked) => onSettingsChange({ ...settings, preserveAlpha: checked })}
                  className="data-[state=checked]:bg-zinc-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversionSettings;