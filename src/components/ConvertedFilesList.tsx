import React from 'react';
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ConvertedFile {
  id: string;
  name: string;
  url: string;
  timestamp: Date;
  originalSize: number;
}

interface ConvertedFilesListProps {
  files: ConvertedFile[];
}

const ConvertedFilesList = ({ files }: ConvertedFilesListProps) => {
  if (files.length === 0) return null;

  const handleDownload = async (file: ConvertedFile) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return mb < 1 
      ? `${(mb * 1024).toFixed(1)} KB`
      : `${mb.toFixed(1)} MB`;
  };

  const [convertedSizes, setConvertedSizes] = React.useState<{ [key: string]: number }>({});

  React.useEffect(() => {
    files.forEach(file => {
      fetch(file.url)
        .then(response => response.blob())
        .then(blob => {
          setConvertedSizes(prev => ({ ...prev, [file.id]: blob.size }));
        })
        .catch(console.error);
    });
  }, [files]);

  const calculateSizeReduction = (originalSize: number, newSize: number): string => {
    const reduction = ((originalSize - newSize) / originalSize) * 100;
    return reduction > 0 ? `-${reduction.toFixed(1)}%` : `+${Math.abs(reduction).toFixed(1)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold font-mono">Converted Files</h2>
        <span className="text-xs text-zinc-500 font-mono">{files.length} file{files.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="border border-zinc-200 bg-[#FAFAFA]">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-zinc-200">
              <TableHead className="font-mono text-xs uppercase text-zinc-600 font-medium">Name</TableHead>
              <TableHead className="font-mono text-xs uppercase text-zinc-600 font-medium">Size</TableHead>
              <TableHead className="font-mono text-xs uppercase text-zinc-600 font-medium">Date</TableHead>
              <TableHead className="text-right font-mono text-xs uppercase text-zinc-600 font-medium">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id} className="border-b border-zinc-200">
                <TableCell className="font-mono text-sm text-zinc-900">{file.name}</TableCell>
                <TableCell className="font-mono text-sm">
                  <div className="space-y-1">
                    <div className="text-zinc-900">
                      {convertedSizes[file.id] ? formatFileSize(convertedSizes[file.id]) : '...'}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-500">from {formatFileSize(file.originalSize)}</span>
                      {convertedSizes[file.id] && (
                        <span className={convertedSizes[file.id] < file.originalSize ? "text-green-600" : "text-red-600"}>
                          {calculateSizeReduction(file.originalSize, convertedSizes[file.id])}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm text-zinc-900">
                  {file.timestamp.toLocaleString(undefined, {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    className="bg-zinc-900 hover:bg-white text-white hover:text-zinc-900 border border-zinc-900 h-8 px-3 font-mono text-xs transition-colors duration-200"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ConvertedFilesList;