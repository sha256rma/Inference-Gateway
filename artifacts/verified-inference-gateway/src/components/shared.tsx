import { type ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { sources } from "@/mock/sources";
import { Info } from "lucide-react";

export function SourceRef({ id, children }: { id: keyof typeof sources; children?: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help border-b border-dashed border-border/50 hover:bg-muted transition-colors">
          {children ? children : <Info className="w-3 h-3 text-muted-foreground" />}
          {!children && <span className="text-[10px] text-muted-foreground font-mono">[{id}]</span>}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-sm border-border bg-card text-card-foreground p-3 shadow-none">
        <p className="font-semibold mb-1 text-xs font-mono">{id}</p>
        <p className="leading-relaxed">{sources[id]}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function SimulatedTag() {
  return (
    <span className="inline-flex items-center justify-center px-1.5 py-0.5 ml-2 text-[9px] font-mono font-medium tracking-widest text-muted-foreground bg-muted border border-border">
      SIMULATED
    </span>
  );
}
