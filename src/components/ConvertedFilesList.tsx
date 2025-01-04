import React from 'react';
import { Download, Trash2, FileVideo, ExternalLink, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface ConvertedFile {
  id: string;
  name: string;
  url: string;
  timestamp: Date;
  originalSize: number;
  convertedSize?: number;
}

interface ConvertedFilesListProps {
  files: ConvertedFile[];
  onDelete: (fileId: string) => void;
}

const ConvertedFilesList = ({ files, onDelete }: ConvertedFilesListProps) => {
  const [loading, setLoading] = React.useState<{ [key: string]: boolean }>({});
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleDownload = async (file: ConvertedFile) => {
    try {
      setLoading(prev => ({ ...prev, [file.id]: true }));
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
    } finally {
      setLoading(prev => ({ ...prev, [file.id]: false }));
    }
  };

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
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
    }
    if (hours > 0) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }
    if (minutes > 0) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    }
    return 'Just now';
  };

  const handleDeleteClick = (fileId: string) => {
    setDeleteConfirm(fileId);
  };

  const handleDeleteConfirm = (fileId: string, confirmed: boolean) => {
    if (confirmed) {
      onDelete(fileId);
      toast({
        title: "File deleted",
        description: "The converted GIF has been removed from history",
      });
    }
    setDeleteConfirm(null);
  };

  if (files.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Conversion History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-[200px] text-center space-y-2">
            <FileVideo className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No converted files yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Conversion History</CardTitle>
          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-muted rounded-none">
            {files.length} files
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%] min-w-[120px]">Name</TableHead>
                <TableHead className="w-[30%] min-w-[100px]">Size</TableHead>
                <TableHead className="hidden md:table-cell w-[20%]">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileVideo className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="truncate max-w-[150px] sm:max-w-[200px]">{file.name}</div>
                        <div className="md:hidden text-xs text-muted-foreground">
                          {formatDate(file.timestamp)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {file.convertedSize ? formatFileSize(file.convertedSize) : '...'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="hidden sm:inline">from</span> 
                        <span>{formatFileSize(file.originalSize)}</span>
                        {file.convertedSize && (
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
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(file.timestamp)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {file.timestamp.toLocaleString()}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDownload(file)}
                        disabled={loading[file.id]}
                      >
                        {loading[file.id] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="relative w-8 h-8">
                        {deleteConfirm === file.id ? (
                          <div className="absolute inset-0 flex gap-1 animate-in fade-in slide-in-from-right-1 duration-150">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                              onClick={() => handleDeleteConfirm(file.id, true)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteConfirm(file.id, false)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 animate-in fade-in slide-in-from-left-1 duration-150"
                            onClick={() => handleDeleteClick(file.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConvertedFilesList;