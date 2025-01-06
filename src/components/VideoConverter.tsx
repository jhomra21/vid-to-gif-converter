import React, { useState, useEffect, useRef } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { convertVideoToGif } from '@/utils/gifConverter';
import { ensureFFmpeg, terminateFFmpeg } from '@/utils/ensureFFmpeg';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FileUpload from './FileUpload';
import ConversionSettings from './ConversionSettings';
import ConversionProgress from './ConversionProgress';
import ConvertedFilesList from './ConvertedFilesList';
import ConversionLogs from './ConversionLogs';
import { Button } from "@/components/ui/button";
import LocationWeather from './LocationWeather';
import { ExternalLink, Download, Loader2, ChevronDown } from 'lucide-react';
import { ConvertedFileInfo, type ConvertedFile } from './ConvertedFileInfo';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const VideoConverter = () => {
  const [video, setVideo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [settings, setSettings] = useState({
    fps: 30,
    width: 800,
    dither: true,
    optimizePalette: true,
    ditherStrength: 5,
    loop: 0,
    compression: 6,
    preserveAlpha: true,
  });
  const [isConverting, setIsConverting] = useState(false);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [conversionLogs, setConversionLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('convert');
  const { toast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionPhase, setConversionPhase] = useState<'initializing' | 'converting'>('initializing');
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    // Preload FFmpeg when component mounts
    ensureFFmpeg().catch(error => {
      toast({
        title: "Failed to load converter",
        description: "Please check your internet connection and try again.",
        variant: "destructive",
      });
    });

    // Cleanup FFmpeg when component unmounts
    return () => {
      terminateFFmpeg();
    };
  }, []);

  const handleFileSelect = (file: File, previewUrl: string) => {
    setVideo(file);
    setPreview(previewUrl);
    setConversionLogs([]); // Clear logs when new file is selected
  };

  // Listen for video metadata to get duration
  useEffect(() => {
    if (videoRef.current) {
      const handleLoadedMetadata = () => {
        setVideoDuration(videoRef.current?.duration || 0);
      };
      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [preview]);

  const addLog = (message: string) => {
    setConversionLogs(prev => [...prev, message]);
    
    // Check for initialization complete
    if (message.includes('palette.png')) {
      setConversionPhase('converting');
      setConversionProgress(0); // Reset progress for conversion phase
      return;
    }
    
    // Parse progress from FFmpeg output
    const progressMatch = message.match(/Converting:\s+(\d+(\.\d+)?)%/);
    if (progressMatch) {
      const progress = parseFloat(progressMatch[1]);
      setConversionProgress(progress);
    }
  };

  const estimateOutputSize = () => {
    if (!video || !videoDuration) return 0;

    // GIF size estimation formula:
    // width * height * frames * bytes_per_pixel * compression_factor
    const framesPerSecond = settings.fps;
    const totalFrames = Math.ceil(videoDuration * framesPerSecond);
    const compressionFactor = (10 - settings.compression) / 10; // Higher compression = smaller size
    const widthFactor = settings.width / 800; // Base width of 800px
    const bytesPerPixel = settings.optimizePalette ? 1 : 2; // Optimized palette uses less colors
    const heightFactor = widthFactor; // Assuming roughly square aspect ratio for estimation
    
    // Base calculation
    const estimatedBytes = settings.width * (settings.width * heightFactor) * totalFrames * bytesPerPixel * compressionFactor;
    
    // Apply additional factors
    const ditherFactor = settings.dither ? 1.2 : 1; // Dithering adds some size
    const finalEstimate = estimatedBytes * ditherFactor;
    
    return Math.round(finalEstimate);
  };

  const handleConvert = async () => {
    if (!video) return;
    
    setIsConverting(true);
    setConversionLogs([]); // Clear previous logs
    setConversionProgress(0); // Reset progress
    setConversionPhase('initializing'); // Start with initialization phase
    
    try {
      // First terminate any existing instance
      await terminateFFmpeg();
      // Then ensure a fresh instance is loaded
      await ensureFFmpeg();
      // Now convert the video
      const gifBlob = await convertVideoToGif(video, settings, addLog);
      const gifUrl = URL.createObjectURL(gifBlob);
      
      const newFile: ConvertedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: video.name.replace(/\.[^/.]+$/, "") + ".gif",
        url: gifUrl,
        timestamp: new Date(),
        originalSize: video.size,
        convertedSize: gifBlob.size,
        settings: { ...settings }, // Store the settings used for this conversion
      };
      
      setConvertedFiles(prev => [newFile, ...prev]);
      toast({
        title: "Conversion complete",
        description: "Your GIF is ready to download!",
      });
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Conversion failed",
        description: error instanceof Error ? error.message : "An error occurred during conversion",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
      setConversionProgress(0);
      setConversionPhase('initializing');
    }
  };

  const handleDelete = (fileId: string) => {
    setConvertedFiles(prev => {
      const fileToDelete = prev.find(f => f.id === fileId);
      if (fileToDelete) {
        // Revoke the object URL to prevent memory leaks
        URL.revokeObjectURL(fileToDelete.url);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const handleNewVideo = () => {
    setVideo(null);
    setPreview('');
    setConversionLogs([]);
    setShowConfirmDialog(false);
  };

  // Add a key that changes when we reset
  const uploadKey = video ? 'has-video' : 'no-video';

  const handleDownload = async (file: ConvertedFile) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
      setLoading({ [file.id]: false });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "An error occurred during download",
        variant: "destructive",
      });
      setLoading({ [file.id]: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold font-mono">Video to GIF</h1>
          <p className="text-muted-foreground font-mono">
            Convert your videos to GIF format with custom settings
          </p>
        </div>
        <LocationWeather />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="convert">Convert</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent 
          value="convert" 
          className="space-y-8 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100 transition-opacity duration-150"
        >
          <div className={cn(
            "transition-all duration-300 ease-in-out",
            !video ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 h-0 overflow-hidden"
          )}>
            <FileUpload 
              key={uploadKey}
              onFileSelect={handleFileSelect} 
            />
          </div>

          <div className={cn(
            "transition-all duration-300 ease-in-out",
            video ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 h-0 overflow-hidden"
          )}>
            {video && (
              <div className="space-y-6 md:grid md:grid-cols-2 md:gap-8 md:space-y-0">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium">Preview</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowConfirmDialog(true)}
                      className="text-xs font-mono"
                    >
                      Select New Video
                    </Button>
                  </div>
                  
                  <div className="overflow-hidden rounded-lg border bg-muted">
                    <video 
                      ref={videoRef}
                      src={preview} 
                      controls 
                      className="w-full"
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground font-mono">
                    <p>Original size: {Math.round(video.size / 1024)} KB</p>
                    <p>Estimated output: {Math.round(estimateOutputSize() / 1024)} KB</p>
                    <p className="text-xs opacity-75">Based on {videoDuration.toFixed(1)}s duration at {settings.fps} FPS</p>
                  </div>

                  {/* Mobile Settings */}
                  <div className="md:hidden space-y-6">
                    <ConversionSettings 
                      settings={settings}
                      onSettingsChange={setSettings}
                    />
                  </div>

                  <div className="space-y-4">
                    <ConversionProgress 
                      isConverting={isConverting}
                      onConvert={handleConvert}
                      progress={conversionProgress}
                      phase={conversionPhase}
                    />

                    {convertedFiles.length > 0 && (
                      <div className="space-y-4">
                        {/* Main preview - most recent conversion */}
                        <ConvertedFileInfo
                          file={convertedFiles[0]}
                          loading={loading[convertedFiles[0].id]}
                          onDownload={handleDownload}
                          onDelete={handleDelete}
                          showDelete
                        />

                        {/* History section */}
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-muted-foreground">Recent Conversions</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveTab('history')}
                              className="text-xs font-mono"
                            >
                              View Conversion History
                            </Button>
                          </div>
                          
                          <div className="space-y-2">
                            {convertedFiles.slice(1, 4).map(file => (
                              <ConvertedFileInfo
                                key={file.id}
                                file={file}
                                loading={loading[file.id]}
                                onDownload={handleDownload}
                                onDelete={handleDelete}
                                showDelete
                                compact
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="hidden md:block space-y-6">
                  <div className="sticky top-6">
                    <div className="space-y-6">
                      <ConversionSettings 
                        settings={settings}
                        onSettingsChange={setSettings}
                      />

                      <Collapsible open={showLogs} onOpenChange={setShowLogs}>
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-medium">Conversion Logs</h2>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-9 p-0">
                              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", {
                                "transform rotate-180": showLogs
                              })}/>
                              <span className="sr-only">Toggle logs</span>
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="transition-all duration-300 ease-out data-[state=closed]:animate-collapse data-[state=open]:animate-expand overflow-hidden">
                          <div className="pt-4">
                            <ConversionLogs logs={conversionLogs} />
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>
                </div>

                {/* Mobile Logs */}
                <div className="md:hidden space-y-4">
                  <Collapsible open={showLogs} onOpenChange={setShowLogs}>
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium">Conversion Logs</h2>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-9 p-0">
                          <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", {
                            "transform rotate-180": showLogs
                          })}/>
                          <span className="sr-only">Toggle logs</span>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="transition-all duration-300 ease-out data-[state=closed]:animate-collapse data-[state=open]:animate-expand overflow-hidden">
                      <div className="pt-4">
                        <ConversionLogs logs={conversionLogs} />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent 
          value="history" 
          className="mt-6 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100 transition-opacity duration-150"
        >
          <ConvertedFilesList 
            files={convertedFiles} 
            onDelete={handleDelete}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Select New Video?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your current video and any unsaved settings. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleNewVideo}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VideoConverter;
