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
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    
    video.onloadedmetadata = () => {
      onLog(`Video metadata loaded: ${video.duration.toFixed(2)}s, ${video.videoWidth}x${video.videoHeight}`);
      
      // Calculate dimensions
      const aspectRatio = video.videoWidth / video.videoHeight;
      const height = Math.round(settings.width / aspectRatio);
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(video.src);
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      canvas.width = settings.width;
      canvas.height = height;
      
      // Initialize GIF encoder with minimal options
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: settings.width,
        height: height
      });

      // Calculate total frames
      const frameCount = Math.ceil(video.duration * settings.fps);
      let currentFrame = 0;
      
      onLog(`Starting conversion: ${frameCount} frames at ${settings.fps} FPS`);
      
      // Process frames in smaller batches
      const batchSize = 10;
      let currentBatch = 0;
      
      const processNextBatch = () => {
        const batchStart = currentBatch * batchSize;
        const batchEnd = Math.min(batchStart + batchSize, frameCount);
        
        if (batchStart >= frameCount) {
          onLog('Rendering final GIF...');
          gif.render();
          return;
        }
        
        // Process frames in current batch
        const processFrame = (frameIndex: number) => {
          if (frameIndex >= batchEnd) {
            currentBatch++;
            setTimeout(processNextBatch, 0); // Allow UI to update
            return;
          }
          
          const timeOffset = frameIndex / settings.fps;
          video.currentTime = timeOffset;
          
          video.onseeked = () => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            
            gif.addFrame(frameData, {
              delay: Math.round(1000 / settings.fps),
              dispose: 1
            });
            
            currentFrame++;
            if (currentFrame % Math.ceil(frameCount / 10) === 0) {
              onLog(`Processed ${currentFrame} of ${frameCount} frames (${Math.round(currentFrame / frameCount * 100)}%)`);
            }
            
            processFrame(frameIndex + 1);
          };
        };
        
        processFrame(batchStart);
      };
      
      // Handle GIF encoding events
      gif.on('progress', (p: number) => {
        onLog(`Encoding: ${Math.round(p * 100)}%`);
      });
      
      gif.on('finished', (blob: Blob) => {
        onLog(`Conversion complete! GIF size: ${Math.round(blob.size / 1024)} KB`);
        URL.revokeObjectURL(video.src);
        resolve(blob);
      });
      
      gif.on('error', (error: Error) => {
        onLog(`Error during conversion: ${error.message}`);
        URL.revokeObjectURL(video.src);
        reject(error);
      });
      
      // Start processing
      video.play().then(() => {
        video.pause();
        processNextBatch();
      }).catch(error => {
        onLog(`Error playing video: ${error.message}`);
        reject(error);
      });
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };
  });
};