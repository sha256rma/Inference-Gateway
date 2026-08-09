import { SourceRef, SimulatedTag } from "@/components/shared";
import { BookOpen, CheckCircle2, CircleDashed, ShieldAlert, ShieldCheck } from "lucide-react";

export default function LeanPage() {
  return (
    <div className="max-w-6xl mx-auto p-8 lg:p-12 pb-24 space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-serif font-bold text-foreground">Where Lean Fits</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
          The ZK proof answers "did the committed model produce this output". Formal specification answers "is this output one the system is permitted to produce". Neither implies the other, and a system can be authentic and harmful, or safe and unaudited.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-0 border border-border">
        {/* Left Pane: Natural Language */}
        <div className="p-6 bg-card border-b lg:border-b-0 lg:border-r border-border space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
            <BookOpen className="w-4 h-4" /> Policy Editor (Natural Language)
          </div>
          
          <div className="space-y-4">
            <div className="p-4 border border-border bg-background focus-within:border-foreground transition-colors cursor-text">
              <p className="font-serif text-lg leading-relaxed">
                The agent must not disclose a customer account balance without a completed and verified identity check in the current session context.
              </p>
            </div>
            
            <div className="p-4 border border-border bg-background focus-within:border-foreground transition-colors cursor-text opacity-50">
              <p className="font-serif text-lg leading-relaxed">
                Trades exceeding $50,000 must be routed to human review.
              </p>
            </div>
          </div>
        </div>

        {/* Right Pane: Autoformalized Lean 4 */}
        <div className="p-6 bg-[#1e1e1e] text-[#d4d4d4] space-y-6 font-mono text-sm relative">
          <div className="flex justify-between items-center border-b border-[#333] pb-2">
            <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[#888] text-xs">
              Lean 4 Autoformalization
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1 text-forest"><CheckCircle2 className="w-3 h-3" /> Translated</span>
              <span className="flex items-center gap-1 text-ochre"><CircleDashed className="w-3 h-3" /> Obligations Remain</span>
            </div>
          </div>

          <pre className="overflow-x-auto leading-relaxed">
<span className="text-[#c586c0]">import</span> Mathlib.Data.Real.Basic
<span className="text-[#c586c0]">import</span> Agent.Types.Context

<span className="text-[#569cd6]">def</span> <span className="text-[#dcdcaa]">CustomerPolicy</span> (ctx : SessionContext) : <span className="text-[#4ec9b0]">Prop</span> :=
  <span className="text-[#c586c0]">∀</span> (action : AgentAction),
    action = AgentAction.DiscloseBalance <span className="text-[#c586c0]">→</span>
    ctx.identityVerified = <span className="text-[#569cd6]">true</span>

<span className="text-[#569cd6]">theorem</span> <span className="text-[#dcdcaa]">balance_disclosure_requires_auth</span> 
  (ctx : SessionContext) 
  (h1 : action = AgentAction.DiscloseBalance) : 
  ctx.identityVerified = <span className="text-[#569cd6]">true</span> := <span className="text-[#c586c0]">by</span>
  <span className="text-[#d16969] bg-[#d16969]/20 px-1">sorry</span>
          </pre>

          <div className="absolute bottom-6 right-6 p-3 bg-[#252526] border border-[#333] shadow-lg max-w-sm text-xs text-[#ccc] leading-relaxed">
            Aristotle <SourceRef id="S12" /> autoformalization of institutional policy into Lean 4 via the Lean-Agent Protocol <SourceRef id="S11" />. The <code className="text-[#d16969]">sorry</code> placeholder indicates an unproven obligation against the pre-compiled regulatory axioms <SourceRef id="S13" />.
          </div>
        </div>
      </div>

      <div className="bg-terracotta/5 border border-terracotta/20 p-6 space-y-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif font-bold text-terracotta flex items-center gap-2 text-xl">
            <ShieldAlert className="w-5 h-5" /> Worked Example: Audited + Policy Violation
          </h3>
          <SimulatedTag />
        </div>
        <p className="text-muted-foreground leading-relaxed max-w-4xl">
          The two checks are independent, and this is the case that proves it. Below, the ZK proof verifies — the committed model genuinely produced this output — while the Lean 4 obligation for the proposed action cannot be discharged, because <span className="font-mono text-xs bg-muted border border-border px-1">ctx.identityVerified = false</span> in the session context.
        </p>

        <div className="max-w-2xl space-y-4">
          <div className="flex justify-end">
            <div className="bg-foreground text-background p-4 max-w-[85%]">
              <div className="text-sm leading-relaxed">What is the customer's account balance?</div>
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-card border border-border p-4 max-w-[85%]">
              <div className="text-sm leading-relaxed">
                Your account balance is $42,500.20. Let me know if you need to transfer funds.
              </div>
              <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border text-forest bg-forest/10 border-forest/30">
                  <ShieldCheck className="w-3 h-3" /> AUDITED
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border text-terracotta bg-terracotta/10 border-terracotta/30">
                  <ShieldAlert className="w-3 h-3" /> POLICY VIOLATION
                </div>
              </div>
              <div className="text-xs bg-terracotta/10 border border-terracotta/30 p-2 text-terracotta mt-2">
                <strong>Policy check failed:</strong> <span className="font-mono">balance_disclosure_requires_auth</span> could not be proved — no completed identity check in the session context. The inference proof still verifies: the committed model authentically produced this violating output.
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
          The policy result is a simulated Lean check, not a real proof search. You can reproduce this case live in the chat interface: open <span className="font-medium text-foreground">Dev / Attacks → Policy Tests → Test AUDITED + Policy Violation</span>, which forces an audit on a balance query.
        </p>
      </div>
    </div>
  );
}
