import React from 'react';
import { FileVideo } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { ConvertedFileInfo, type ConvertedFile } from './ConvertedFileInfo';

interface ConvertedFilesListProps {
  files: ConvertedFile[];
  onDelete: (fileId: string) => void;
}

const ConvertedFilesList = ({ files, onDelete }: ConvertedFilesListProps) => {
  const [loading, setLoading] = React.useState<{ [key: string]: boolean }>({});
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

  const handleDelete = (fileId: string) => {
    onDelete(fileId);
    toast({
      title: "File deleted",
      description: "The converted GIF has been removed from history",
    });
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
          <div className="space-y-2">
            {files.map((file) => (
              <ConvertedFileInfo
                key={file.id}
                file={file}
                loading={loading[file.id]}
                onDownload={handleDownload}
                onDelete={handleDelete}
                showDelete
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ConvertedFilesList;