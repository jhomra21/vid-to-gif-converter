import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Download } from "lucide-react";
import { convertVideoToGif } from '@/utils/gifConverter';
import FileUpload from './FileUpload';
import ConversionSettings from './ConversionSettings';
import ConvertedFilesList from './ConvertedFilesList';

interface ConvertedFile {
  id: string;
  name: string;
  url: string;
  timestamp: Date;
}

const VideoConverter = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [settings, setSettings] = useState({
    fps: 15,
    quality: 75,
    width: 480,
  });
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const { toast } = useToast();

  const handleFileSelect = (file: File, previewUrl: string) => {
    setVideo(file);
    setPreview(previewUrl);
  };

  const handleConvert = async () => {
    if (!video) return;
    
    setIsConverting(true);
    try {
      const gifBlob = await convertVideoToGif(video, settings);
      const gifUrl = URL.createObjectURL(gifBlob);
      
      const newFile: ConvertedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: video.name.replace(/\.[^/.]+$/, "") + ".gif",
        url: gifUrl,
        timestamp: new Date(),
      };
      
      setConvertedFiles(prev => [newFile, ...prev]);
      toast({
        title: "Conversion complete",
        description: "Your GIF is ready to download!",
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "An error occurred during conversion",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center gap-8 bg-industrial-gradient">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Video to GIF</h1>
          <p className="text-muted-foreground">Convert your videos to GIF format with custom settings</p>
        </div>

        <FileUpload onFileSelect={handleFileSelect} />

        {video && (
          <>
            <ConversionSettings 
              settings={settings}
              onSettingsChange={setSettings}
            />

            <Button
              onClick={handleConvert}
              disabled={isConverting}
              className="w-full bg-industrial-accent hover:bg-industrial-accent/90"
            >
              {isConverting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  Converting...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Convert & Download
                </span>
              )}
            </Button>
          </>
        )}

        <ConvertedFilesList files={convertedFiles} />
      </div>
    </div>
  );
};

export default VideoConverter;