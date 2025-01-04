import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpegInstance: FFmpeg | null = null;

export const ensureFFmpeg = async () => {
  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  try {
    const ffmpeg = new FFmpeg();
    console.log('Starting FFmpeg load...');
    
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm';
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    console.log('FFmpeg loaded successfully');
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    throw new Error('Failed to load FFmpeg. Please check your internet connection and try again.');
  }
};