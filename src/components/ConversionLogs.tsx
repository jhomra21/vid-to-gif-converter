import { ScrollArea } from "./ui/scroll-area";

interface ConversionLogsProps {
  logs: string[];
}

const ConversionLogs = ({ logs }: ConversionLogsProps) => {
  if (logs.length === 0) return null;

  return (
    <ScrollArea className="h-[200px] w-full rounded-md border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="space-y-2">
        {logs.map((log, index) => (
          <div key={index} className="font-mono text-sm text-zinc-400">
            {log}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ConversionLogs;