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
    
    await ffmpeg.load({
      coreURL: await toBlobURL(
        'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.js',
        'text/javascript'
      ),
      wasmURL: await toBlobURL(
        'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd/ffmpeg-core.wasm',
        'application/wasm'
      ),
    });

    console.log('FFmpeg loaded successfully');
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    throw new Error('Failed to load FFmpeg. Please check your internet connection and try again.');
  }
};