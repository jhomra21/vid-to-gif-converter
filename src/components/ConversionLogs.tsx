import React, { useEffect, useRef } from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface ConversionLogsProps {
  logs: string[];
}

const ConversionLogs = ({ logs }: ConversionLogsProps) => {
  const { toast } = useToast();
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logs.length > 0) {
      const viewport = document.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport instanceof HTMLElement) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [logs]);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n')).then(() => {
      toast({
        title: "Logs copied",
        description: "Conversion logs have been copied to clipboard",
      });
    });
  };

  return (
    <Card className={cn(
      "relative transition-all duration-300 ease-out",
      "data-[state=closed]:translate-y-[-10px] data-[state=closed]:opacity-0",
      "data-[state=open]:translate-y-0 data-[state=open]:opacity-100"
    )}>
      <div className="absolute right-2 top-2 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleCopyLogs}
          disabled={logs.length === 0}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="h-[300px]">
        <ScrollAreaPrimitive.Viewport ref={viewportRef} className="h-full">
          <div className="p-4 font-mono text-xs">
            {logs.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No logs available
              </div>
            ) : (
              <pre className="whitespace-pre-wrap break-all">
                {logs.map((log, index) => (
                  <div key={index} className="py-0.5">
                    {`>_ ${log}`}
                  </div>
                ))}
              </pre>
            )}
          </div>
        </ScrollAreaPrimitive.Viewport>
      </ScrollArea>
    </Card>
  );
};

export default ConversionLogs;