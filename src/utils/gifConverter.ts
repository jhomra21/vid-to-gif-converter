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
      const ctx = canvas.getContext('2d');
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

      const frameCount = Math.round((video.duration * settings.fps));
      let currentFrame = 0;

      function addFrame() {
        if (currentFrame >= frameCount) {
          gif.render();
          return;
        }

        video.currentTime = currentFrame / settings.fps;
        currentFrame++;

        video.onseeked = () => {
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          gif.addFrame(ctx, { copy: true, delay: 1000 / settings.fps });
          addFrame();
        };
      }

      gif.on('finished', (blob: Blob) => {
        resolve(blob);
      });

      gif.on('error', (error: Error) => {
        reject(error);
      });

      addFrame();
    };

    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
  });
};