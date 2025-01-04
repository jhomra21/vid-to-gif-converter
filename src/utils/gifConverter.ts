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
    
    video.onloadedmetadata = () => {
      video.currentTime = 0;
    };
    
    video.onloadeddata = () => {
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
      
      const gif = new GIF({
        workers: 2,
        quality: Math.round(31 - (settings.quality * 0.3)),
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

      let currentFrameIndex = 0;

      const processNextFrame = () => {
        if (currentFrameIndex >= frames.length) {
          gif.render();
          return;
        }

        video.currentTime = frames[currentFrameIndex];
      };

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        gif.addFrame(ctx, { copy: true, delay: 1000 / settings.fps });
        currentFrameIndex++;
        processNextFrame();
      };

      gif.on('finished', (blob: Blob) => {
        URL.revokeObjectURL(video.src);
        resolve(blob);
      });

      gif.on('error', (error: Error) => {
        URL.revokeObjectURL(video.src);
        reject(error);
      });

      // Start processing frames
      processNextFrame();
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };
  });
};