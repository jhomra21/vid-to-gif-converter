import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File, previewUrl: string) => void;
}

const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onFileSelect(file, previewUrl);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onFileSelect(file, previewUrl);
    }
  };

  return (
    <div
      className="border-2 border-dashed border-border hover:bg-secondary/50 transition-colors cursor-pointer"
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
        <div className="space-y-2">
          <p className="text-lg">Drop your video here</p>
          <p className="text-sm text-muted-foreground">or click to browse</p>
          <Button variant="outline" size="sm" className="mt-2">
            Select Video
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Supports all common video formats from mobile and desktop devices
        </p>
      </div>
    </div>
  );
};

export default FileUpload;