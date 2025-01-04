import { useEffect, useRef } from "react";
import { ScrollArea } from "./ui/scroll-area";

interface ConversionLogsProps {
  logs: string[];
}

const ConversionLogs = ({ logs }: ConversionLogsProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current;
      scrollContainer.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [logs]);

  if (logs.length === 0) return null;

  return (
    <ScrollArea className="h-[200px] w-full rounded-sm border border-gray-200 bg-gray-50 p-4">
      <div className="space-y-2">
        {logs.map((log, index) => (
          <div key={index} className="font-mono text-sm text-gray-600">
            {log}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  );
};

export default ConversionLogs;