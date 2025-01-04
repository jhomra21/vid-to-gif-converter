import React, { useRef, useEffect } from 'react';
import { Download, Trash2, ExternalLink, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConvertedFile {
  id: string;
  name: string;
  url: string;
  timestamp: Date;
  originalSize: number;
  convertedSize?: number;
  settings: {
    fps: number;
    width: number;
    dither: boolean;
    optimizePalette: boolean;
    ditherStrength: number;
    loop: number;
    compression: number;
    preserveAlpha: boolean;
  };
}

interface ConvertedFileInfoProps {
  file: ConvertedFile;
  loading?: boolean;
  showDelete?: boolean;
  compact?: boolean;
  onDownload: (file: ConvertedFile) => void;
  onDelete?: (fileId: string) => void;
  className?: string;
}

const formatFileSize = (bytes: number): string => {
  const mb = bytes / (1024 * 1024);
  return mb < 1 
    ? `${(mb * 1024).toFixed(1)} KB`
    : `${mb.toFixed(1)} MB`;
};

const calculateSizeReduction = (originalSize: number, newSize: number): string => {
  const reduction = ((originalSize - newSize) / originalSize) * 100;
  return reduction > 0 ? `-${reduction.toFixed(1)}%` : `+${Math.abs(reduction).toFixed(1)}%`;
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString();
};

export const ConvertedFileInfo = ({ 
  file, 
  loading, 
  showDelete = false,
  compact = false,
  onDownload, 
  onDelete,
  className 
}: ConvertedFileInfoProps) => {
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);
  const deleteConfirmRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deleteConfirm && deleteConfirmRef.current && !deleteConfirmRef.current.contains(event.target as Node)) {
        setDeleteConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [deleteConfirm]);

  const handleDeleteClick = () => {
    setDeleteConfirm(true);
  };

  const handleDeleteConfirm = (confirmed: boolean) => {
    if (confirmed && onDelete) {
      onDelete(file.id);
    }
    setDeleteConfirm(false);
  };

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 bg-muted/30 border",
      className
    )}>
      <img 
        src={file.url} 
        alt={file.name}
        className={cn(
          "object-cover bg-background rounded-sm",
          compact ? "w-8 h-8" : "w-12 h-12"
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            "font-medium truncate",
            compact ? "text-xs" : "text-sm"
          )}>{file.name}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
            <span>{Math.round(file.convertedSize! / 1024)} KB</span>
            {file.originalSize && file.convertedSize && (
              <span className={cn(
                "px-1 py-0.5 text-xs rounded-md font-medium",
                file.convertedSize < file.originalSize 
                  ? "bg-green-100 text-green-700" 
                  : "bg-red-100 text-red-700"
              )}>
                {calculateSizeReduction(file.originalSize, file.convertedSize)}
              </span>
            )}
          </div>
        </div>
        <div className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground mt-1 font-mono",
          compact ? "text-[10px]" : "text-xs"
        )}>
          <span>{file.settings.fps}fps</span>
          <span>{file.settings.width}px</span>
          <span>c:{file.settings.compression}x</span>
          <span>{file.settings.dither ? `d:${file.settings.ditherStrength}` : 'd:off'}</span>
          <span>{file.settings.optimizePalette ? 'opt:on' : 'opt:off'}</span>
          <span>{file.settings.loop === 0 ? 'loop:∞' : `loop:${file.settings.loop}`}</span>
          <span className="opacity-75">{formatDate(file.timestamp)}</span>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", compact && "h-7 w-7")}
          onClick={() => window.open(file.url, '_blank')}
        >
          <ExternalLink className={cn("h-4 w-4", compact && "h-3 w-3")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", compact && "h-7 w-7")}
          onClick={() => onDownload(file)}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className={cn("animate-spin h-4 w-4", compact && "h-3 w-3")} />
          ) : (
            <Download className={cn("h-4 w-4", compact && "h-3 w-3")} />
          )}
        </Button>
        {showDelete && (
          <div className={cn("relative", compact ? "w-7 h-7" : "w-8 h-8")}>
            {deleteConfirm ? (
              <div 
                ref={deleteConfirmRef}
                className="absolute inset-0 flex gap-1 animate-in fade-in slide-in-from-right-1 duration-150"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-green-500 hover:text-green-600 hover:bg-green-50",
                    compact ? "h-7 w-7" : "h-8 w-8"
                  )}
                  onClick={() => handleDeleteConfirm(true)}
                >
                  <Check className={cn("h-4 w-4", compact && "h-3 w-3")} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "text-red-500 hover:text-red-600 hover:bg-red-50",
                    compact ? "h-7 w-7" : "h-8 w-8"
                  )}
                  onClick={() => handleDeleteConfirm(false)}
                >
                  <X className={cn("h-4 w-4", compact && "h-3 w-3")} />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-red-500 hover:text-red-600 hover:bg-red-50 animate-in fade-in slide-in-from-left-1 duration-150",
                  compact ? "h-7 w-7" : "h-8 w-8"
                )}
                onClick={handleDeleteClick}
              >
                <Trash2 className={cn("h-4 w-4", compact && "h-3 w-3")} />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export type { ConvertedFile }; 