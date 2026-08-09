import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/context/AppContext";
import { mockCompile } from "@/mock/api";
import { SourceRef, SimulatedTag } from "@/components/shared";
import { ArrowRight, AlertTriangle, Cpu, Settings2, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function QuantizePage() {
  const { model, setCompilation } = useApp();
  const [, setLocation] = useLocation();
  
  const [scale, setScale] = useState(16);
  const [system, setSystem] = useState<"halo2" | "groth16" | "gkr">("halo2");
  const [isCompiling, setIsCompiling] = useState(false);
  const [output, setOutput] = useState<Awaited<ReturnType<typeof mockCompile>> | null>(null);

  // If no model, redirect back
  useEffect(() => {
    if (!model) setLocation("/upload");
  }, [model, setLocation]);

  if (!model) return null;

  const handleCompile = async () => {
    setIsCompiling(true);
    setOutput(null);
    const result = await mockCompile(scale, system);
    setCompilation({ scale, provingSystem: system, ...result });
    setOutput(result);
    setIsCompiling(false);
  };

  const getAccuracyDelta = (bitWidth: number) => {
    if (bitWidth === 8) return "0.5% – 2.0% degradation (Naive Fixed-Point)";
    if (bitWidth === 16) return "< 10⁻⁴ perplexity delta (Lookup-Table Regime)";
    return "< 10⁻⁵ perplexity delta (High Precision)";
  };

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12 space-y-12 pb-24">
      <header className="space-y-4">
        <h1 className="text-4xl font-serif font-bold text-foreground">2. Quantization & Compilation</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Zero-knowledge circuits operate over finite fields (modular integer arithmetic). Floating-point models must be quantized before compilation.
        </p>
      </header>

      {/* WARNING BANNER */}
      <div className="bg-muted border border-border p-6 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-terracotta shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h3 className="font-bold text-foreground">The circuit proves the quantized model, not the floating-point model you uploaded.</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These are different mathematical artifacts. Furthermore, because weights enter the circuit as a private witness, the circuit encodes only the <strong>architecture</strong>. Every fine-tune of this architecture compiles to the exact same circuit. Model identity is established later.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* QUANTIZATION PANEL */}
        <section className="space-y-8">
          <div className="space-y-2 border-b border-border pb-2">
            <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
              <Settings2 className="w-5 h-5" /> Quantization Scale
            </h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium">Bit Width</label>
                <span className="font-mono bg-muted border border-border px-2 py-0.5 text-sm">{scale}-bit</span>
              </div>
              <Slider 
                value={[scale]} 
                min={8} 
                max={24} 
                step={8} 
                onValueChange={(v) => setScale(v[0])}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground font-mono">
                <span>8-bit</span>
                <span>16-bit</span>
                <span>24-bit</span>
              </div>
            </div>

            <div className="p-4 border border-border bg-card space-y-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex justify-between">
                Accuracy Penalty <SourceRef id={scale === 8 ? "S17" : "S6"} />
              </div>
              <div className="font-mono text-sm text-foreground">
                {getAccuracyDelta(scale)}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Naive 8-bit quantization typically costs 0.5–2% accuracy on benchmarks <SourceRef id="S17" />. 16-bit lookup-table designs report near-zero degradation <SourceRef id="S6" /> <SourceRef id="S7" />.
            </p>
          </div>
        </section>

        {/* COMPILER PANEL */}
        <section className="space-y-8">
          <div className="space-y-2 border-b border-border pb-2">
            <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
              <Cpu className="w-5 h-5" /> Proving System
            </h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-4 p-4 border border-border cursor-pointer transition-colors hover:bg-muted/50 has-[:checked]:bg-muted has-[:checked]:border-foreground">
              <input 
                type="radio" 
                name="system" 
                value="halo2" 
                checked={system === "halo2"} 
                onChange={() => setSystem("halo2")}
                className="mt-1"
              />
              <div>
                <h4 className="font-bold">Halo2 / Plonkish <SourceRef id="S4" /></h4>
                <p className="text-sm text-muted-foreground mt-1">Lookup-argument support, no per-circuit trusted setup (IPA). Heavy prover memory (tens of GBs) <SourceRef id="S17a" />, proofs in 1–10 kB range.</p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 border border-border cursor-pointer transition-colors hover:bg-muted/50 has-[:checked]:bg-muted has-[:checked]:border-foreground">
              <input 
                type="radio" 
                name="system" 
                value="groth16" 
                checked={system === "groth16"} 
                onChange={() => setSystem("groth16")}
                className="mt-1"
              />
              <div>
                <h4 className="font-bold">Groth16</h4>
                <p className="text-sm text-muted-foreground mt-1">Constant proofs (~128 bytes), millisecond verification. Requires circuit-specific trusted setup.</p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 border border-border cursor-pointer transition-colors hover:bg-muted/50 has-[:checked]:bg-muted has-[:checked]:border-foreground">
              <input 
                type="radio" 
                name="system" 
                value="gkr" 
                checked={system === "gkr"} 
                onChange={() => setSystem("gkr")}
                className="mt-1"
              />
              <div>
                <h4 className="font-bold">GKR / Sumcheck <SourceRef id="S1" /> <SourceRef id="S7" /></h4>
                <p className="text-sm text-muted-foreground mt-1">Fastest known prover for ML workloads. E.g. sub-25s GPT-2 proofs <SourceRef id="S5" /> or 150s/token Llama-3 (developer claims) <SourceRef id="S18" />. Larger proofs (~200 kB), verification in hundreds of milliseconds.</p>
              </div>
            </label>
          </div>
        </section>
      </div>

      <div className="pt-8 border-t border-border flex justify-end">
        <button 
          onClick={handleCompile}
          disabled={isCompiling}
          className="px-8 py-4 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors inline-flex items-center gap-3 disabled:opacity-50"
        >
          {isCompiling ? (
            <>
              <div className="w-5 h-5 rounded-full border-t-2 border-background animate-spin" />
              Compiling Circuit...
            </>
          ) : (
            <>
              {output ? "Recompile Circuit" : "Compile to Arithmetic Circuit"} <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {output && (
        <section className="space-y-6 pt-8 border-t border-border">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-serif font-bold">Compilation Output</h2>
            <SimulatedTag />
          </div>
          <div className="grid md:grid-cols-2 gap-0 border border-border bg-card">
            {[
              ["Constraint Count", output.constraints.toLocaleString()],
              ["Advice Columns", output.adviceColumns.toLocaleString()],
              ["Lookup Table Size", output.lookupTable.toLocaleString()],
              ["Proving Key Size", output.provingKeySize],
              ["Verification Key Size", output.verificationKeySize],
              ["Est. Proving Time", output.estProvingTime],
              ["Est. Peak Memory", output.peakMemory],
              ["Quantization Scale", `${scale}-bit fixed point`],
            ].map(([label, value]) => (
              <div key={String(label)} className="p-4 border-b border-r border-border flex justify-between items-baseline gap-4">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
                <span className="font-mono text-sm text-foreground text-right">{value}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            This circuit encodes the architecture only. Establishing which weights it runs is the job of the audit ceremony.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => setLocation("/audit")}
              className="px-8 py-4 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors inline-flex items-center gap-3"
            >
              Proceed to Audit Ceremony <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
