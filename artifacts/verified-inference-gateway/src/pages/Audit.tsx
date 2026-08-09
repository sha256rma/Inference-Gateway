import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/context/AppContext";
import { mockComputeCommitment, mockPublishLog } from "@/mock/api";
import { SourceRef, SimulatedTag } from "@/components/shared";
import { ArrowRight, ShieldCheck, Check, Info, FileKey, ExternalLink } from "lucide-react";

export default function AuditPage() {
  const { model, compilation, setPassport } = useApp();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState(0);
  const [commitment, setCommitment] = useState("");
  const [merkleRoot, setMerkleRoot] = useState("");
  const [transparencyIndex, setTransparencyIndex] = useState(0);

  // If no compilation, redirect back
  useEffect(() => {
    if (!compilation || !model) setLocation("/quantize");
  }, [compilation, model, setLocation]);

  useEffect(() => {
    const runCeremony = async () => {
      // Step 1: Compute weight commitment
      setStep(1);
      const c = await mockComputeCommitment();
      setCommitment(c);
      
      // Step 2: Binding
      setStep(2);
      await new Promise(r => setTimeout(r, 1500));
      
      // Step 3: Auditors
      setStep(3);
      await new Promise(r => setTimeout(r, 1500));
      
      // Step 4: Publish to transparency log
      setStep(4);
      const log = await mockPublishLog();
      setMerkleRoot(log.merkleRoot);
      setTransparencyIndex(log.index);

      // Done
      setStep(5);
    };

    if (compilation && step === 0) {
      runCeremony();
    }
  }, [compilation, step]);

  if (!compilation || !model) return null;

  const handleFinish = () => {
    setPassport({
      commitment,
      circuitHash: "0x3f8a...9c2e",
      auditDate: new Date().toISOString(),
      auditors: 2, // simulated 2 signatures
      transparencyIndex,
      merkleRoot
    });
    setLocation("/chat");
  };

  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-12 pb-24 grid lg:grid-cols-[1fr_300px] gap-12">
      <div className="space-y-12">
        <header className="space-y-4">
          <h1 className="text-4xl font-serif font-bold text-foreground">3. Audit Ceremony</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
            Model identity is established here. The provider publishes a polynomial or vector commitment to the weights while the weights themselves remain private.
          </p>
        </header>

        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          
          {/* STEP 1 */}
          <div className="relative flex items-start gap-6">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 bg-background z-10 
              ${step > 1 ? "border-forest text-forest" : step === 1 ? "border-ochre text-ochre animate-pulse" : "border-muted-foreground text-muted-foreground"}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">1</span>}
            </div>
            <div className="pt-1 w-full space-y-4">
              <h3 className="text-xl font-bold">Compute Weight Commitment <SourceRef id="S1" /></h3>
              {step >= 1 && (
                <div className="p-4 bg-muted border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pedersen Commitment (BLS12-381)</span>
                    <SimulatedTag />
                  </div>
                  {commitment ? (
                    <div className="font-mono text-xs break-all text-foreground mb-3">{commitment}</div>
                  ) : (
                    <div className="h-4 bg-border/50 animate-pulse w-3/4 rounded mb-3" />
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2 pt-2 border-t border-border">
                    Real-world commitment costs scale brutally. While zkLLM commits a 13B forward pass in ~16 minutes <SourceRef id="S1" />, extrapolating that across a full 2000-token sequence takes an estimated 23 days of commitment generation before serving can even begin <SourceRef id="S2" />.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* STEP 2 */}
          <div className="relative flex items-start gap-6">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 bg-background z-10 
              ${step > 2 ? "border-forest text-forest" : step === 2 ? "border-ochre text-ochre animate-pulse" : "border-border text-muted-foreground"}`}>
              {step > 2 ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">2</span>}
            </div>
            <div className="pt-1 w-full space-y-4">
              <h3 className="text-xl font-bold text-foreground">Bind to Circuit & Quantization</h3>
              {step >= 2 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Circuit Hash</div>
                    <div className="font-mono text-sm">0x3f8a...9c2e</div>
                  </div>
                  <div className="p-4 border border-border">
                    <div className="text-xs text-muted-foreground mb-1">Quantization</div>
                    <div className="font-mono text-sm">{compilation.scale}-bit Scale</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 3 */}
          <div className="relative flex items-start gap-6">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 bg-background z-10 
              ${step > 3 ? "border-forest text-forest" : step === 3 ? "border-ochre text-ochre animate-pulse" : "border-border text-muted-foreground"}`}>
              {step > 3 ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">3</span>}
            </div>
            <div className="pt-1 w-full space-y-4">
              <h3 className="text-xl font-bold">Auditor Signatures</h3>
              {step >= 3 && (
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 p-2 border border-forest/30 bg-forest/5 text-forest text-sm">
                    <ShieldCheck className="w-4 h-4" /> Trail of Bits
                  </div>
                  <div className="flex items-center gap-2 p-2 border border-forest/30 bg-forest/5 text-forest text-sm">
                    <ShieldCheck className="w-4 h-4" /> Zellic
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* STEP 4 */}
          <div className="relative flex items-start gap-6">
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 bg-background z-10 
              ${step > 4 ? "border-forest text-forest" : step === 4 ? "border-ochre text-ochre animate-pulse" : "border-border text-muted-foreground"}`}>
              {step > 4 ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">4</span>}
            </div>
            <div className="pt-1 w-full space-y-4">
              <h3 className="text-xl font-bold">Publish to Transparency Log</h3>
              {step >= 4 && (
                <div className="p-4 border border-border bg-card">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Append-Only CT-Style Log</span>
                    <SimulatedTag />
                  </div>
                  {merkleRoot ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Index</span>
                        <span className="font-mono">#{transparencyIndex}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Merkle Root</span>
                        <span className="font-mono text-xs truncate max-w-[200px]" title={merkleRoot}>{merkleRoot}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="h-4 bg-border/50 animate-pulse w-full rounded" />
                      <div className="h-4 bg-border/50 animate-pulse w-3/4 rounded" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {step === 5 && (
          <div className="pt-8 flex justify-end">
            <button 
              onClick={handleFinish}
              className="px-8 py-4 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors inline-flex items-center gap-3"
            >
              Generate Passport & Continue <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <aside className="space-y-8">
        <div className="bg-muted border border-border p-6 space-y-4">
          <h3 className="font-serif font-bold flex items-center gap-2 text-lg">
            <Info className="w-5 h-5" /> Certificate Transparency Analogy
          </h3>
          <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
            <p>
              This commitment ceremony is analogous to TLS certificate issuance, and the transparency log mirrors a CT log.
            </p>
            <p className="font-medium text-foreground">
              However, note the critical disanalogy:
            </p>
            <p>
              TLS authenticates an endpoint and secures a channel, but it never certifies that the server computed anything correctly. That is the gap this system fills.
            </p>
          </div>
        </div>

        {step === 5 && (
          <div className="border border-border p-6 bg-card space-y-6 shadow-sm">
            <div className="text-center pb-4 border-b border-border">
              <FileKey className="w-8 h-8 mx-auto mb-2 text-foreground" />
              <h3 className="font-serif font-bold text-xl uppercase tracking-widest">Model Passport</h3>
              <p className="text-xs text-muted-foreground">{model.name}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground uppercase block mb-1">Commitment</span>
                <span className="font-mono text-xs truncate block" title={commitment}>{commitment.substring(0, 16)}...</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase block mb-1">Architecture</span>
                <span className="block font-medium">{model.archGuess}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase block mb-1">Proving System</span>
                <span className="block font-medium uppercase">{compilation.provingSystem}</span>
              </div>
              <div className="pt-2 flex items-center justify-between text-xs text-forest font-bold border-t border-border mt-4">
                <span>VERIFIED IDENTITY</span>
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
