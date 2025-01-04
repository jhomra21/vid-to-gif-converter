import GIF from 'gif.js';

export const convertVideoToGif = (
  videoFile: File,
  settings: {
    fps: number;
    quality: number;
    width: number;
  }
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    console.log('Starting conversion with settings:', settings);
    
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    
    video.onloadedmetadata = () => {
      console.log('Video metadata loaded:', {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      });
      video.currentTime = 0;
    };
    
    video.onloadeddata = () => {
      console.log('Video data loaded, setting up canvas');
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
      
      console.log('Initializing GIF encoder', {
        width: settings.width,
        height: height,
        quality: settings.quality,
        fps: settings.fps
      });

      const gif = new GIF({
        workers: 2,
        quality: Math.round(31 - (settings.quality * 0.3)), // Convert quality percentage to GIF.js quality
        width: settings.width,
        height: height,
        workerScript: '/gif.worker.js'
      });

      const frames: number[] = [];
      const duration = video.duration;
      const frameInterval = 1 / settings.fps;
      
      for (let time = 0; time < duration; time += frameInterval) {
        frames.push(time);
      }

      console.log(`Processing ${frames.length} frames at ${settings.fps} FPS`);

      let currentFrameIndex = 0;

      const processNextFrame = () => {
        if (currentFrameIndex >= frames.length) {
          console.log('All frames processed, rendering GIF');
          gif.render();
          return;
        }

        video.currentTime = frames[currentFrameIndex];
      };

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        gif.addFrame(ctx, { copy: true, delay: 1000 / settings.fps });
        currentFrameIndex++;
        
        if (currentFrameIndex % 10 === 0) {
          console.log(`Processed ${currentFrameIndex} of ${frames.length} frames`);
        }
        
        processNextFrame();
      };

      gif.on('progress', (progress: number) => {
        console.log(`GIF encoding progress: ${Math.round(progress * 100)}%`);
      });

      gif.on('finished', (blob: Blob) => {
        console.log('GIF conversion complete, size:', Math.round(blob.size / 1024), 'KB');
        URL.revokeObjectURL(video.src);
        resolve(blob);
      });

      gif.on('error', (error: Error) => {
        console.error('GIF conversion error:', error);
        URL.revokeObjectURL(video.src);
        reject(error);
      });

      // Start processing frames
      processNextFrame();
    };

    video.onerror = (error) => {
      console.error('Video loading error:', error);
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };
  });
};