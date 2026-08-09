import { useState } from "react";
import { SourceRef } from "@/components/shared";
import { Activity, AlertTriangle, Calculator, BarChart } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function TrainingPage() {
  const [params, setParams] = useState<number>(10_000_000);
  const [steps, setSteps] = useState<number>(500_000);

  // Baseline from Kaizen: 10M params, 1 iteration = 15 mins (0.25 hours) -> 0.0000285 years
  // At 10M params and 500k steps: 500,000 * 0.25 = 125,000 hours = 14.26 years
  
  const calculateYears = (p: number, s: number) => {
    const scaleFactor = p / 10_000_000;
    const hours = s * 0.25 * scaleFactor;
    return hours / (24 * 365.25);
  };

  const years = calculateYears(params, steps);

  const presetKaizen = () => { setParams(10_000_000); setSteps(500_000); };
  const preset7B = () => { setParams(7_000_000_000); setSteps(100_000); };

  const chartData = [
    { name: "10M (Kaizen)", years: calculateYears(10_000_000, 500_000) },
    { name: "100M", years: calculateYears(100_000_000, 500_000) },
    { name: "1B", years: calculateYears(1_000_000_000, 500_000) },
    { name: "7B (LLaMA-class)", years: calculateYears(7_000_000_000, 500_000) }
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-12 pb-24 space-y-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted border border-border text-xs font-mono font-bold tracking-widest text-muted-foreground uppercase">
          <Activity className="w-3 h-3" /> Research Direction, Not Currently Feasible
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground">Zero-Knowledge Proof of Training (zkPoT)</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          A customer paying a third party to train a model receives only a weights file and has no guarantee the contracted computation ran. The cryptographic shape is a zero-knowledge proof of training (zkPoT).
        </p>
      </header>

      <div className="bg-muted border border-border p-6 flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 space-y-4">
          <h3 className="font-serif font-bold text-xl flex items-center gap-2">
            The Kaizen Baseline <SourceRef id="S8" />
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Kaizen uses GKR-style proofs per gradient-descent iteration composed via incremental verifiable computation. Proof size (1.63 MB) and verifier time (130 ms) stay independent of iteration count and dataset size.
          </p>
          <p className="text-sm font-bold">
            However, proving takes 15 minutes per training iteration on a 10-million-parameter VGG-11 network.
          </p>
        </div>
        
        <div className="w-full md:w-80 shrink-0 bg-card border border-border p-4 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
            <Calculator className="w-4 h-4" /> Extrapolation Calculator
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Parameter Count</label>
              <input 
                type="number" 
                value={params} 
                onChange={e => setParams(Number(e.target.value) || 0)}
                className="w-full p-2 border border-border bg-background text-sm font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Optimizer Steps</label>
              <input 
                type="number" 
                value={steps} 
                onChange={e => setSteps(Number(e.target.value) || 0)}
                className="w-full p-2 border border-border bg-background text-sm font-mono"
              />
            </div>
            
            <div className="pt-2 border-t border-border">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Est. Proving Time</div>
              <div className="text-2xl font-serif font-bold text-terracotta">
                {years.toLocaleString(undefined, { maximumFractionDigits: 1 })} years
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button onClick={presetKaizen} className="flex-1 text-[10px] py-1 border border-border bg-muted hover:bg-border/50">10M (Kaizen)</button>
              <button onClick={preset7B} className="flex-1 text-[10px] py-1 border border-border bg-muted hover:bg-border/50">7B @ 100k</button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="font-serif font-bold text-2xl flex items-center gap-2">
          <BarChart className="w-5 h-5" /> Linear Scaling Assumption
        </h3>
        <p className="text-muted-foreground max-w-2xl">
          The calculator extrapolates linearly in parameters from the Kaizen baseline. In reality, prover cost is quasi-linear in circuit size, not exactly linear, but the order of magnitude remains prohibitive.
        </p>

        <div className="h-80 w-full border border-border p-4 bg-card">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis scale="log" domain={['auto', 'auto']} stroke="var(--color-muted-foreground)" fontSize={12} 
                     label={{ value: 'Years of Proving Time (Log Scale)', angle: -90, position: 'insideLeft', offset: -10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: 0 }}
                formatter={(value: number) => [`${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} years`, 'Proving Time']}
              />
              <Line type="monotone" dataKey="years" stroke="var(--color-terracotta)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-terracotta)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-6 pt-8 border-t border-border opacity-60">
        <h3 className="font-serif font-bold text-xl">Weaker Statements (Design Proposals)</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 border border-border bg-muted/50">
            <h4 className="font-bold text-sm mb-2">Random Subsampling</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Proof over a randomly sampled subset of training steps rather than the full trajectory.</p>
          </div>
          <div className="p-4 border border-border bg-muted/50">
            <h4 className="font-bold text-sm mb-2">Fine-Tuning Only <SourceRef id="S14" /></h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Proof over PEFT/LoRA stages. Recent prototypes report 16.8 seconds/step for rank-8 LoRA over 2048 tokens.</p>
          </div>
          <div className="p-4 border border-border bg-muted/50">
            <h4 className="font-bold text-sm mb-2">Dataset Membership</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Proof of dataset membership or exclusion without proving the actual optimisation process.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
