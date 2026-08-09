import { Link, useLocation } from "wouter";
import { useApp } from "@/context/AppContext";
import { 
  Upload, 
  Cpu, 
  ShieldCheck, 
  MessageSquare, 
  BookOpen, 
  Activity, 
  AlertTriangle, 
  Library 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/upload", label: "1. Upload", icon: Upload, requires: null },
  { path: "/quantize", label: "2. Quantize & Compile", icon: Cpu, requires: "model" },
  { path: "/audit", label: "3. Audit Ceremony", icon: ShieldCheck, requires: "compilation" },
  { path: "/chat", label: "4. Verified Chat", icon: MessageSquare, requires: "passport" },
  { path: "/lean", label: "Where Lean Fits", icon: BookOpen, requires: "passport" },
];

const secondaryItems = [
  { path: "/training", label: "Training (Research)", icon: Activity },
  { path: "/limits", label: "Limits & Guarantees", icon: AlertTriangle },
  { path: "/sources", label: "Source Register", icon: Library },
];

export function Sidebar() {
  const [location] = useLocation();
  const state = useApp();

  const isLocked = (requires: string | null) => {
    if (requires === "model" && !state.model) return true;
    if (requires === "compilation" && !state.compilation) return true;
    if (requires === "passport" && !state.passport) return true;
    return false;
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-card flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h1 className="font-serif font-bold text-xl tracking-tight text-foreground leading-tight">
          Verified Inference<br />Gateway
        </h1>
        <p className="text-xs font-mono text-muted-foreground mt-2 border border-border inline-block px-1 bg-muted">
          RESEARCH DEMONSTRATOR
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const locked = isLocked(item.requires);
          const active = location === item.path;
          
          return (
            <Link 
              key={item.path} 
              href={locked ? "#" : item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors relative",
                locked && "opacity-50 cursor-not-allowed",
                active && "bg-foreground text-background",
                !active && !locked && "hover:bg-muted text-foreground"
              )}
              onClick={(e) => locked && e.preventDefault()}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 truncate pr-1">{item.label}</span>
              {locked && <span className="shrink-0 text-[10px] uppercase font-mono tracking-wider">Locked</span>}
            </Link>
          );
        })}

        <div className="mt-8 mb-2 px-3 text-xs font-mono font-medium text-muted-foreground tracking-widest uppercase">
          References
        </div>
        
        {secondaryItems.map((item) => {
          const active = location === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                active && "bg-foreground text-background",
                !active && "hover:bg-muted text-foreground"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
