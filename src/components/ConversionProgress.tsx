import React from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download } from "lucide-react";

interface ConversionProgressProps {
  isConverting: boolean;
  onConvert: () => void;
  progress?: number;
  phase?: 'initializing' | 'converting';
}

const ConversionProgress = ({ 
  isConverting, 
  onConvert, 
  progress = 0,
  phase = 'initializing'
}: ConversionProgressProps) => {
  return (
    <div className="space-y-2">
      <Button
        onClick={onConvert}
        disabled={isConverting}
        className="w-full bg-zinc-900 hover:bg-white text-white hover:text-zinc-900 border border-zinc-900 h-10 font-mono text-xs transition-colors duration-200 rounded-none"
      >
        {isConverting ? (
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>
              {phase === 'initializing' ? 'Initializing' : 'Converting'}... {progress.toFixed(1)}%
            </span>
          </div>
        ) : (
          <span className="flex items-center gap-2">
            <Download className="w-3 h-3" />
            Convert to GIF
          </span>
        )}
      </Button>
      {isConverting && (
        <Progress 
          value={progress} 
          className="h-1 rounded-none [&>div]:rounded-none bg-zinc-100" 
        />
      )}
    </div>
  );
}

export default ConversionProgress;