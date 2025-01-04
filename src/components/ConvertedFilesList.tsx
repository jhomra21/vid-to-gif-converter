import React from 'react';
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ConvertedFile {
  id: string;
  name: string;
  url: string;
  timestamp: Date;
}

interface ConvertedFilesListProps {
  files: ConvertedFile[];
}

const ConvertedFilesList = ({ files }: ConvertedFilesListProps) => {
  if (files.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Converted Files</h2>
      <div className="border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id}>
                <TableCell>{file.name}</TableCell>
                <TableCell>{file.timestamp.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Download className="w-4 h-4" />
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