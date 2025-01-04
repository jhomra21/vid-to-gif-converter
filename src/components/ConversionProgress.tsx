import { Download } from "lucide-react";
import { Button } from "./ui/button";

interface ConversionProgressProps {
  isConverting: boolean;
  onConvert: () => void;
}

const ConversionProgress = ({ isConverting, onConvert }: ConversionProgressProps) => {
  return (
    <Button
      onClick={onConvert}
      disabled={isConverting}
      variant="outline"
      className="w-full bg-zinc-900 hover:bg-white text-white hover:text-zinc-900 border border-zinc-900 h-10 font-mono text-xs transition-colors duration-200"
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
          <span>Converting...</span>
        </div>
      ) : (
        <span className="flex items-center gap-2">
          <Download className="w-3 h-3" />
          Convert
        </span>
      )}
    </Button>
  );
};

export default ConversionProgress;