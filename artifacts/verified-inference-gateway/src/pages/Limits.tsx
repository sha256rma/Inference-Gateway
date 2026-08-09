import { SourceRef } from "@/components/shared";
import { AlertTriangle, Clock, ShieldAlert, Cpu } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function LimitsPage() {
  const chartData = [
    { name: "zkLLM (Llama-2-13B) [S1]", prove: 803, verify: 2.36 },
    { name: "ZKTorch (GPT-2) [S4]", prove: 599, verify: 12 },
    { name: "NanoZK (GPT-2 Small) [S6]", prove: 516, verify: 0.3 }, // 8.6 min = 516s, 12 layers * 25ms = 300ms = 0.3s
    { name: "Kaizen (VGG-11 Train) [S8]", prove: 900, verify: 0.13 }, // 15 min = 900s
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-12 pb-24 space-y-16">
      <header className="space-y-4 border-b border-border pb-8">
        <h1 className="text-4xl font-serif font-bold text-foreground flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-terracotta" /> Limits & Guarantees
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          The cryptographic guarantees provided by zero-knowledge ML are narrow, specific, and often misunderstood. This system is bound by the following structural limits.
        </p>
      </header>

      {/* The Proving vs Verification Asymmetry Chart */}
      <section className="space-y-6">
        <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
          <Clock className="w-5 h-5" /> The Proving vs Verification Asymmetry
        </h2>
        <p className="text-muted-foreground max-w-3xl leading-relaxed">
          The core value proposition of zkML is asymmetric computation: shifting immense cost onto the prover so the verifier can run in milliseconds to seconds. The asymmetry spans four to six orders of magnitude.
        </p>
        
        <div className="h-96 w-full border border-border p-6 bg-card">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis scale="log" domain={['auto', 'auto']} stroke="var(--color-muted-foreground)" fontSize={12} 
                     label={{ value: 'Time in Seconds (Log Scale)', angle: -90, position: 'insideLeft', offset: -10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: 0 }}
                formatter={(value: number) => [`${value} s`, '']}
              />
              <Legend />
              <Bar dataKey="prove" name="Proving Time (s)" fill="var(--color-terracotta)" />
              <Bar dataKey="verify" name="Verification Time (s)" fill="var(--color-forest)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold">1. Execution integrity is not correctness.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A proof of correct inference shows only that the committed weights produced the output. It says nothing about whether the output was correct, safe, or appropriate. The proof certifies a harmful answer as readily as a safe one.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold">2. Undetectable backdoors.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Goldwasser, Kim, Vaikuntanathan, and Zamir (FOCS 2022) construct backdoors that are computationally undetectable given full white-box access <SourceRef id="S19" />. Proving you ran the committed weights says nothing about whether those weights are trustworthy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold text-terracotta flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> 3. Hollow-LLM
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Gong, Liu, and Li (IEEE S&P 2026) <SourceRef id="S10" /> demonstrate that ghost weights satisfy the verification circuit at much lower serving cost. Thus, verification does not bind correctness to computational work. The paper shows sparsity-style countermeasures are both expensive and insufficient.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold">4. The quantized circuit boundary.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The proof is about the quantized arithmetic circuit, not the floating-point model. The conversion process introduces accuracy penalties (0.5–2% for naive 8-bit, or negligible for 16-bit lookups <SourceRef id="S6" /> <SourceRef id="S17" />), and the floating-point artifact is fundamentally unprovable in this stack. Additionally, generating these proofs requires immense prover RAM—often tens of gigabytes even for models under 2 million parameters <SourceRef id="S17a" />.
            </p>
          </section>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold">5. Sampling gives statistical guarantees.</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Detection probability equals the audit rate for a single targeted deviation. Sustained cheating is caught quickly; targeted cheating on one high-stakes query is not.
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-serif font-bold flex items-center gap-2">
              <Cpu className="w-5 h-5" /> 7. GPU nondeterminism.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Identical weights on different hardware, or even across reorderings on the same hardware, produce different floating-point outputs. This breaks naive verification by re-execution <SourceRef id="S20" />, and it is part of why fixed-point quantization is strictly required on the ZK path.
            </p>
          </section>
        </div>
      </div>

      <section className="space-y-6 pt-12 border-t border-border">
        <h2 className="text-xl font-serif font-bold">6. Alternatives with different trust roots</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse border border-border">
            <thead className="bg-muted text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-4 border-b border-r border-border">System</th>
                <th className="p-4 border-b border-r border-border">Trust Root</th>
                <th className="p-4 border-b border-r border-border">Prover Overhead</th>
                <th className="p-4 border-b border-r border-border">Verifier Cost</th>
                <th className="p-4 border-b border-r border-border">What it proves</th>
                <th className="p-4 border-b border-border">What it misses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="p-4 border-r border-border font-bold">TEE (Confidential Computing)</td>
                <td className="p-4 border-r border-border">Hardware vendor & enclave</td>
                <td className="p-4 border-r border-border">Near zero</td>
                <td className="p-4 border-r border-border">Remote attestation check</td>
                <td className="p-4 border-r border-border">Code running in enclave</td>
                <td className="p-4">Side-channel attacks, vendor trust</td>
              </tr>
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="p-4 border-r border-border font-bold">Optimistic Re-execution <SourceRef id="S20" /> <SourceRef id="S21" /></td>
                <td className="p-4 border-r border-border">Crypto-economic (1-of-N honest)</td>
                <td className="p-4 border-r border-border">None (off-chain)</td>
                <td className="p-4 border-r border-border">Dispute resolution delay</td>
                <td className="p-4 border-r border-border">Execution correctness</td>
                <td className="p-4">Finality time, requires bitwise repro (RepOps)</td>
              </tr>
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="p-4 border-r border-border font-bold">Activation Fingerprinting <SourceRef id="S2" /> <SourceRef id="S22" /></td>
                <td className="p-4 border-r border-border">Detection model / Locality hashes</td>
                <td className="p-4 border-r border-border">Minimal (258B per 32 tokens)</td>
                <td className="p-4 border-r border-border">100x faster than inference</td>
                <td className="p-4 border-r border-border">Locality bounds</td>
                <td className="p-4">Requires trained detection model per target</td>
              </tr>
              <tr className="hover:bg-muted/50 transition-colors bg-card">
                <td className="p-4 border-r border-border font-bold text-foreground">Full ZK (This Demo)</td>
                <td className="p-4 border-r border-border text-foreground font-medium">Math / Cryptography</td>
                <td className="p-4 border-r border-border text-terracotta font-medium">1000x to 10000x</td>
                <td className="p-4 border-r border-border text-forest font-medium">Milliseconds</td>
                <td className="p-4 border-r border-border">Execution integrity</td>
                <td className="p-4">Hollow-LLM, scale bounds</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
