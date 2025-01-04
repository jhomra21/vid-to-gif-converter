import React, { useRef } from 'react';
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File, previewUrl: string) => void;
}

const FileUpload = ({ onFileSelect }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      onFileSelect(file, url);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid video file.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      onFileSelect(file, url);
    }
  };

  return (
    <div
      className="border-2 border-dashed border-border bg-background hover:bg-secondary/50 transition-colors cursor-pointer"
      onClick={() => fileInputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {!preview ? (
        <div className="p-8 space-y-4">
          <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
          <div>
            <p className="text-lg">Drag and drop your video here</p>
            <p className="text-sm text-muted-foreground">or click to browse</p>
          </div>
        </div>
      ) : (
        <video
          src={preview}
          controls
          className="w-full h-auto"
        />
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />
    </div>
  );
};

export default FileUpload;