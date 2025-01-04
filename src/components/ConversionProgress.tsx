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
      className="w-full bg-industrial-accent hover:bg-industrial-accent/90"
    >
      {isConverting ? (
        <span className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-t-transparent border-white animate-spin" />
          Converting...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Convert & Download
        </span>
      )}
    </Button>
  );
};

export default ConversionProgress;