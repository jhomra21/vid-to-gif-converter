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
    width: number;
    dither: boolean;
    optimizePalette: boolean;
    ditherStrength: number;
  },
  onLog: (message: string) => void
): Promise<Blob> => {
  let ffmpeg: FFmpeg | null = null;
  
  try {
    ffmpeg = await ensureFFmpeg();
    onLog('FFmpeg loaded successfully');
    
    const inputFileName = 'input-' + Date.now() + '.mp4';
    const outputFileName = 'output.gif';
    const paletteFileName = 'palette.png';
    
    ffmpeg.on('log', ({ message }) => {
      onLog(message);
    });
    
    ffmpeg.on('progress', ({ progress }) => {
      onLog(`Converting: ${(progress * 100).toFixed(2)}%`);
    });
    
    const videoData = await fetchFile(videoFile);
    await ffmpeg.writeFile(inputFileName, videoData);
    
    const dimensions = await getVideoDimensions(videoFile);
    const aspectRatio = dimensions.width / dimensions.height;
    const height = Math.round(settings.width / aspectRatio);
    
    const fps = Math.min(settings.fps, 60);
    const scale = `scale=${settings.width}:${height}:flags=lanczos`;
    
    // Advanced filtering options based on settings
    const filters = [];
    filters.push(scale);
    filters.push(`fps=${fps}`);
    
    if (settings.optimizePalette) {
      // Generate a high-quality palette first
      await ffmpeg.exec([
        '-i', inputFileName,
        '-vf', `${filters.join(',')},palettegen=stats_mode=full:max_colors=256`,
        '-y', paletteFileName
      ]);
      
      // Apply the palette with dithering settings
      const paletteuse = settings.dither
        ? `paletteuse=dither=floyd_steinberg:diff_mode=rectangle:bayer_scale=${settings.ditherStrength}`
        : 'paletteuse=dither=none';
      
      await ffmpeg.exec([
        '-i', inputFileName,
        '-i', paletteFileName,
        '-lavfi', `${filters.join(',')},${paletteuse}`,
        '-y', outputFileName
      ]);
    } else {
      // Direct conversion with basic settings
      await ffmpeg.exec([
        '-i', inputFileName,
        '-vf', filters.join(','),
        '-gifflags', '+transdiff',
        '-y', outputFileName
      ]);
    }
    
    onLog('Reading converted file...');
    const data = await ffmpeg.readFile(outputFileName);
    const gifBlob = new Blob([data], { type: 'image/gif' });
    
    // Cleanup
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);
    if (settings.optimizePalette) {
      await ffmpeg.deleteFile(paletteFileName);
    }
    
    onLog('Conversion complete!');
    return gifBlob;
    
  } catch (error) {
    console.error('Conversion error:', error);
    onLog(`Error during conversion: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};