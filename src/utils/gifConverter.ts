import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { ensureFFmpeg } from './ensureFFmpeg';

const getVideoDimensions = (videoFile: File): Promise<{ width: number, height: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight
      });
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = URL.createObjectURL(videoFile);
  });
};

export const convertVideoToGif = async (
  videoFile: File,
  settings: {
    fps: number;
    quality: number;
    width: number;
  },
  onLog: (message: string) => void
): Promise<Blob> => {
  let ffmpeg: FFmpeg | null = null;
  
  try {
    ffmpeg = await ensureFFmpeg();
    onLog('FFmpeg loaded successfully');
    
    const inputFileName = 'input-' + Date.now() + '.mp4';
    const outputFileName = 'output.gif';
    
    ffmpeg.on('log', ({ message }) => {
      onLog(message);
      console.log(message);
    });
    
    ffmpeg.on('progress', ({ progress }) => {
      onLog(`Converting: ${(progress * 100).toFixed(2)}%`);
    });
    
    const videoData = await fetchFile(videoFile);
    await ffmpeg.writeFile(inputFileName, videoData);
    
    const dimensions = await getVideoDimensions(videoFile);
    const aspectRatio = dimensions.width / dimensions.height;
    const height = Math.round(settings.width / aspectRatio);
    
    const fps = Math.min(settings.fps, 30);
    const scale = `scale=${settings.width}:${height}:flags=lanczos`;
    
    await ffmpeg.exec([
      '-i', inputFileName,
      '-vf', `${scale},fps=${fps}`,
      '-gifflags', '+transdiff',
      '-y', outputFileName
    ]);
    
    onLog('Reading converted file...');
    const data = await ffmpeg.readFile(outputFileName);
    const gifBlob = new Blob([data], { type: 'image/gif' });
    
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);
    
    onLog('Conversion complete!');
    return gifBlob;
    
  } catch (error) {
    console.error('Conversion error:', error);
    onLog(`Error during conversion: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  } finally {
    if (ffmpeg) {
      try {
        await ffmpeg.terminate();
      } catch (e) {
        console.error('Error terminating FFmpeg:', e);
      }
    }
  }
};