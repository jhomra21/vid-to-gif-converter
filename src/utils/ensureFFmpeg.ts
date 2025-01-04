import { toBlobURL } from '@ffmpeg/util';

export const ensureFFmpeg = async () => {
  try {
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd';
    
    const ffmpegCore = await fetch(`${baseURL}/ffmpeg-core.js`);
    const ffmpegCoreWasm = await fetch(`${baseURL}/ffmpeg-core.wasm`);
    
    const ffmpegCoreBlob = await ffmpegCore.blob();
    const ffmpegCoreWasmBlob = await ffmpegCoreWasm.blob();
    
    const ffmpegCoreURL = URL.createObjectURL(ffmpegCoreBlob);
    const ffmpegCoreWasmURL = URL.createObjectURL(ffmpegCoreWasmBlob);
    
    return {
      coreURL: ffmpegCoreURL,
      wasmURL: ffmpegCoreWasmURL
    };
  } catch (error) {
    console.error('Failed to load FFmpeg:', error);
    throw error;
  }
};