import { sources } from "@/mock/sources";
import { Library } from "lucide-react";

export default function SourcesPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12 pb-24 space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-serif font-bold text-foreground flex items-center gap-3">
          <Library className="w-8 h-8 text-muted-foreground" /> Source Register
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          Every literature number in this demonstrator is wired to one of the entries below. Hovering a citation marker anywhere in the interface shows the same entry. Shipped as <span className="font-mono text-sm bg-muted border border-border px-1">src/mock/sources.ts</span>.
        </p>
      </header>

      <div className="border border-border bg-card divide-y divide-border">
        {Object.entries(sources).map(([id, text]) => (
          <div key={id} className="p-5 flex gap-6 items-baseline">
            <span className="font-mono font-bold text-sm shrink-0 w-12 text-foreground border border-border bg-muted px-1.5 py-0.5 text-center">
              {id}
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
