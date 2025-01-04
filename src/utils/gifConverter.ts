import GIF from 'gif.js';

export const convertVideoToGif = (
  videoFile: File,
  settings: {
    fps: number;
    quality: number;
    width: number;
  },
  onLog: (message: string) => void
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    onLog(`Starting conversion with settings: FPS=${settings.fps}, Quality=${settings.quality}%, Width=${settings.width}px`);
    
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    
    video.onloadedmetadata = () => {
      onLog(`Video metadata loaded: ${video.duration.toFixed(2)}s, ${video.videoWidth}x${video.videoHeight}`);
      video.currentTime = 0;
    };
    
    video.onloadeddata = () => {
      onLog('Preparing canvas and encoder...');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to get canvas context'));
        return;
      }

      const aspectRatio = video.videoWidth / video.videoHeight;
      const height = Math.round(settings.width / aspectRatio);
      
      canvas.width = settings.width;
      canvas.height = height;
      
      onLog(`Initializing GIF encoder (${settings.width}x${height})`);

      // Create a new GIF instance with modified settings
      const gif = new GIF({
        workers: 2,
        quality: 1,
        width: settings.width,
        height: height,
        debug: true,
        dither: false,
        repeat: 0
      });

      const frames: number[] = [];
      const duration = video.duration;
      const frameInterval = 1 / settings.fps;
      
      for (let time = 0; time < duration; time += frameInterval) {
        frames.push(time);
      }

      onLog(`Processing ${frames.length} frames at ${settings.fps} FPS`);

      let currentFrameIndex = 0;

      const processNextFrame = () => {
        if (currentFrameIndex >= frames.length) {
          onLog('All frames captured, rendering GIF...');
          try {
            gif.render();
          } catch (error) {
            onLog(`Error during render: ${error}`);
            reject(error);
          }
          return;
        }

        video.currentTime = frames[currentFrameIndex];
      };

      video.onseeked = () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          gif.addFrame(imageData, {
            delay: Math.round(1000 / settings.fps),
            copy: true,
            transparent: false
          });
          
          currentFrameIndex++;
          
          if (currentFrameIndex % 10 === 0 || currentFrameIndex === frames.length) {
            onLog(`Processed ${currentFrameIndex} of ${frames.length} frames`);
          }
          
          processNextFrame();
        } catch (error) {
          onLog(`Error processing frame ${currentFrameIndex}: ${error}`);
          reject(error);
        }
      };

      gif.on('progress', (progress: number) => {
        const percentage = Math.round(progress * 100);
        onLog(`Encoding progress: ${percentage}%`);
      });

      gif.on('finished', (blob: Blob) => {
        onLog(`Conversion complete! GIF size: ${Math.round(blob.size / 1024)} KB`);
        URL.revokeObjectURL(video.src);
        resolve(blob);
      });

      gif.on('error', (error: Error) => {
        onLog(`GIF encoder error: ${error.message}`);
        URL.revokeObjectURL(video.src);
        reject(error);
      });

      processNextFrame();
    };

    video.onerror = (error) => {
      onLog(`Error loading video: ${error}`);
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };
  });
};