import React, { useState, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Settings, Download } from "lucide-react";

const VideoConverter = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [settings, setSettings] = useState({
    fps: 15,
    quality: 75,
    width: 480,
  });
  const [isConverting, setIsConverting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideo(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid video file.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideo(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  const handleConvert = async () => {
    setIsConverting(true);
    // In a real implementation, we would convert the video to GIF here
    // For now, we'll just simulate the conversion
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsConverting(false);
    toast({
      title: "Conversion complete",
      description: "Your GIF is ready to download!",
    });
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center gap-8">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Video to GIF</h1>
          <p className="text-muted-foreground">Convert your videos to GIF format with custom settings</p>
        </div>

        <div
          className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {!preview ? (
            <div className="space-y-4">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg">Drag and drop your video here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
            </div>
          ) : (
            <video
              src={preview}
              controls
              className="max-w-full max-h-[400px] mx-auto"
            />
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/*"
            className="hidden"
          />
        </div>

        {video && (
          <div className="space-y-6 bg-card p-6 rounded-lg">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Conversion Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Frame Rate (FPS)</label>
                <Slider
                  value={[settings.fps]}
                  onValueChange={(value) => setSettings({ ...settings, fps: value[0] })}
                  min={1}
                  max={30}
                  step={1}
                />
                <span className="text-sm text-muted-foreground">{settings.fps} FPS</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Quality</label>
                <Slider
                  value={[settings.quality]}
                  onValueChange={(value) => setSettings({ ...settings, quality: value[0] })}
                  min={1}
                  max={100}
                  step={1}
                />
                <span className="text-sm text-muted-foreground">{settings.quality}%</span>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Width (px)</label>
                <Input
                  type="number"
                  value={settings.width}
                  onChange={(e) => setSettings({ ...settings, width: parseInt(e.target.value) || 0 })}
                  className="max-w-[200px]"
                />
              </div>
            </div>

            <Button
              onClick={handleConvert}
              disabled={isConverting}
              className="w-full"
            >
              {isConverting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  Converting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Convert & Download
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoConverter;