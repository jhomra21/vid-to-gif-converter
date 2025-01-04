import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export const convertVideoToGif = async (
  videoFile: File,
  settings: {
    fps: number;
    quality: number;
    width: number;
  },
  onLog: (message: string) => void
): Promise<Blob> => {
  const ffmpeg = new FFmpeg();
  
  try {
    // Load ffmpeg
    onLog('Loading FFmpeg...');
    await ffmpeg.load({
      coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm'),
    });
    
    onLog('FFmpeg loaded, starting conversion...');
    
    // Write the input video file to FFmpeg's virtual filesystem
    const inputFileName = 'input-' + Date.now() + '.mp4';
    const outputFileName = 'output.gif';
    
    ffmpeg.on('log', ({ message }) => {
      onLog(message);
    });
    
    ffmpeg.on('progress', ({ progress }) => {
      onLog(`Converting: ${(progress * 100).toFixed(2)}%`);
    });
    
    const videoData = await fetchFile(videoFile);
    await ffmpeg.writeFile(inputFileName, videoData);
    
    // Calculate the height maintaining aspect ratio
    const aspectRatio = videoFile.width / videoFile.height;
    const height = Math.round(settings.width / aspectRatio);
    
    // Construct the FFmpeg command
    const fps = Math.min(settings.fps, 30); // Cap FPS at 30 for reasonable file sizes
    const scale = `scale=${settings.width}:${height}:flags=lanczos`;
    const quality = Math.max(1, Math.min(settings.quality, 100)); // Ensure quality is between 1-100
    
    // Execute the conversion
    await ffmpeg.exec([
      '-i', inputFileName,
      '-vf', `${scale},fps=${fps}`,
      '-gifflags', '+transdiff',
      '-y', outputFileName
    ]);
    
    // Read the output file
    onLog('Reading converted file...');
    const data = await ffmpeg.readFile(outputFileName);
    const gifBlob = new Blob([data], { type: 'image/gif' });
    
    // Clean up
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);
    
    onLog('Conversion complete!');
    return gifBlob;
    
  } catch (error) {
    onLog(`Error during conversion: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  } finally {
    ffmpeg.terminate();
  }
};