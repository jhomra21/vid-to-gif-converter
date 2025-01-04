import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { convertVideoToGif } from '@/utils/gifConverter';
import { ensureFFmpeg } from '@/utils/ensureFFmpeg';
import FileUpload from './FileUpload';
import ConversionSettings from './ConversionSettings';
import ConversionProgress from './ConversionProgress';
import ConvertedFilesList from './ConvertedFilesList';
import ConversionLogs from './ConversionLogs';

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
    fps: 30,
    quality: 80,
    width: 800,
  });
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [conversionLogs, setConversionLogs] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Preload FFmpeg when component mounts
    ensureFFmpeg().catch(error => {
      toast({
        title: "Failed to load converter",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
    });
  }, []);

  const handleFileSelect = (file: File, previewUrl: string) => {
    setVideo(file);
    setPreview(previewUrl);
    setConversionLogs([]); // Clear logs when new file is selected
  };

  const addLog = (message: string) => {
    setConversionLogs(prev => [...prev, message]);
    console.log(message); // Also log to console for debugging
  };

  const handleConvert = async () => {
    if (!video) return;
    
    setIsConverting(true);
    setConversionLogs([]); // Clear previous logs
    try {
      const gifBlob = await convertVideoToGif(video, settings, addLog);
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
    <div className="min-h-screen p-6 flex flex-col items-center justify-center gap-8 bg-white">
      <div className="w-full max-w-3xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold font-mono">Video to GIF</h1>
          <p className="text-zinc-600 font-mono">Convert your videos to GIF format with custom settings</p>
        </div>

        <FileUpload onFileSelect={handleFileSelect} />

        {video && (
          <>
            <ConversionSettings 
              settings={settings}
              onSettingsChange={setSettings}
            />

            <ConversionProgress 
              isConverting={isConverting}
              onConvert={handleConvert}
            />

            <ConversionLogs logs={conversionLogs} />
          </>
        )}

        <ConvertedFilesList files={convertedFiles} />
      </div>
    </div>
  );
};

export default VideoConverter;