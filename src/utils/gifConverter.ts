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
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      // Add willReadFrequently attribute to optimize canvas operations
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      const aspectRatio = video.videoWidth / video.videoHeight;
      const height = Math.round(settings.width / aspectRatio);
      
      canvas.width = settings.width;
      canvas.height = height;
      
      const gif = new GIF({
        workers: 2,
        quality: Math.round(31 - (settings.quality * 0.3)), // Convert 1-100 to 30-1 (lower is better)
        width: settings.width,
        height: height,
        workerScript: '/gif.worker.js'
      });

      let framesProcessed = 0;
      const frameCount = Math.round((video.duration * settings.fps));

      function addFrame() {
        if (framesProcessed >= frameCount) {
          gif.render();
          return;
        }

        const currentTime = framesProcessed / settings.fps;
        if (currentTime > video.duration) {
          gif.render();
          return;
        }

        video.currentTime = currentTime;
        framesProcessed++;

        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          gif.addFrame(ctx, { copy: true, delay: 1000 / settings.fps });
          addFrame();
        };
      }

      gif.on('finished', (blob: Blob) => {
        // Clean up resources
        URL.revokeObjectURL(video.src);
        resolve(blob);
      });

      gif.on('error', (error: Error) => {
        // Clean up resources
        URL.revokeObjectURL(video.src);
        reject(error);
      });

      addFrame();
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };
  });
};