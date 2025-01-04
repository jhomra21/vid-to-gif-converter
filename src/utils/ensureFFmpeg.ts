import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const ensureFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpeg) {
    try {
      // Test if the instance is still valid
      await ffmpeg.listDir('/');
      return ffmpeg;
    } catch (e) {
      // If there's an error, the instance is invalid
      ffmpeg = null;
    }
  }

  ffmpeg = new FFmpeg();

  try {
    await ffmpeg.load({
      coreURL: await toBlobURL('/ffmpeg/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('/ffmpeg/ffmpeg-core.wasm', 'application/wasm'),
    });
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    ffmpeg = null;
    throw new Error('Failed to load FFmpeg. Please check if FFmpeg files are available and try again.');
  }

  return ffmpeg;
};

export const terminateFFmpeg = async () => {
  if (ffmpeg) {
    try {
      await ffmpeg.terminate();
    } catch (e) {
      console.error('Error terminating FFmpeg:', e);
    } finally {
      ffmpeg = null;
    }
  }
};