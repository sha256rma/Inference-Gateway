import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useApp } from "@/context/AppContext";
import { mockGenerateProof } from "@/mock/api";
import { SourceRef, SimulatedTag } from "@/components/shared";
import { 
  Send, ShieldCheck, ShieldAlert, Shield, ShieldX, 
  Settings2, ChevronRight, Activity, Terminal, Check
} from "lucide-react";
import { Slider } from "@/components/ui/slider";

type MessageState = "UNVERIFIED" | "SIGNED" | "AUDITED" | "FAILED" | "PENDING_AUDIT";
type AttackType = "none" | "substitution" | "quantization" | "replay" | "hollow";
type PolicyState = "PASS" | "VIOLATION" | "UNCHECKED";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  state?: MessageState;
  policyState?: PolicyState;
  attackContext?: AttackType;
}

export default function ChatPage() {
  const { passport, compilation, model } = useApp();
  const [, setLocation] = useLocation();

  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "I am ready. I will prove my inferences against the committed weights based on your audit rate. You can also test policy constraints.", state: "UNVERIFIED", policyState: "PASS" }
  ]);
  const [input, setInput] = useState("");
  const [auditRate, setAuditRate] = useState(10); // 1 to 100
  const [turns, setTurns] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins in seconds

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeAttack, setActiveAttack] = useState<AttackType>("none");
  const [signingEnabled, setSigningEnabled] = useState(true);
  const [forceAuditNext, setForceAuditNext] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If no passport, redirect back
  useEffect(() => {
    if (!passport) setLocation("/audit");
  }, [passport, setLocation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!passport || !compilation || !model) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTurns(t => t + 1);

    const willAudit = forceAuditNext || Math.random() * 100 <= auditRate;
    setForceAuditNext(false);
    
    // Simulate generation
    const assistantId = (Date.now() + 1).toString();
    
    let simulatedResponse = "This is a simulated response from the model.";
    let policyState: PolicyState = "PASS";
    
    // Check if input asks for account balance (triggering policy violation)
    if (input.toLowerCase().includes("balance") || input.toLowerCase().includes("account")) {
      simulatedResponse = "Your account balance is $42,500.20. Let me know if you need to transfer funds.";
      policyState = "VIOLATION";
    }

    // Some attacks alter behavior before audit
    if (activeAttack === "replay") {
      simulatedResponse = "This is a cached response from a previous session, unrelated to your prompt.";
    } else if (activeAttack === "hollow") {
      simulatedResponse = "I can act as the 70B model, but I am actually a 1B hollow skeleton satisfying the constraint structure.";
    }

    // Serving sequence: the output is signed at serving time (if signing is
    // enabled), BEFORE the provider learns whether this turn will be audited.
    const servedState: MessageState = signingEnabled ? "SIGNED" : "UNVERIFIED";

    const assistantMsg: Message = { 
      id: assistantId, 
      role: "assistant", 
      content: simulatedResponse, 
      state: servedState,
      policyState,
      attackContext: activeAttack
    };
    
    setMessages(prev => [...prev, assistantMsg]);

    // Audit selection happens strictly after serving/signing.
    await new Promise(r => setTimeout(r, 900));

    if (willAudit) {
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, state: "PENDING_AUDIT" } : m));

      // Simulate proof generation
      await mockGenerateProof(turns);
      
      setMessages(prev => prev.map(m => {
        if (m.id === assistantId) {
          let finalState: MessageState = "AUDITED";
          if (m.attackContext === "substitution" || m.attackContext === "quantization" || m.attackContext === "replay") {
            finalState = "FAILED";
          }
          return { ...m, state: finalState };
        }
        return m;
      }));
    }
  };

  const getBadgeConfig = (state: MessageState) => {
    switch (state) {
      case "UNVERIFIED": return { icon: Shield, color: "text-foreground bg-muted border-border", label: "UNVERIFIED" };
      case "SIGNED": return { icon: ShieldCheck, color: "text-ochre bg-ochre/10 border-ochre/30", label: "SIGNED" };
      case "PENDING_AUDIT": return { icon: Activity, color: "text-ochre bg-ochre/10 border-ochre/30 animate-pulse", label: "PROVING (TIME COMPRESSED 1000x)" };
      case "AUDITED": return { icon: ShieldCheck, color: "text-forest bg-forest/10 border-forest/30", label: "AUDITED" };
      case "FAILED": return { icon: ShieldX, color: "text-terracotta bg-terracotta/10 border-terracotta/30", label: "FAILED" };
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full border-r border-border">
        {/* Header */}
        <header className="p-4 border-b border-border bg-card flex justify-between items-center shrink-0">
          <div>
            <h2 className="font-serif font-bold text-lg flex items-center gap-2">
              Verified Session
            </h2>
            <p className="text-xs text-muted-foreground font-mono">Bound to Commitment: {passport.commitment.substring(0, 16)}...</p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Renegotiation In</div>
              <div className="font-mono text-sm">
                {20 - (turns % 20)} turns OR {formatTime(timeLeft)}
              </div>
            </div>
            <button 
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-2 border border-border hover:bg-muted transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Terminal className="w-4 h-4" /> 
              Dev / Attacks
            </button>
          </div>
        </header>

        {/* Audit Rate Control */}
        <div className="p-4 border-b border-border bg-muted/30 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center gap-6 max-w-4xl mx-auto">
            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <Settings2 className="w-4 h-4" /> Audit Rate
                </span>
                <span className="font-mono font-bold bg-foreground text-background px-2 py-0.5">{auditRate}%</span>
              </div>
              <Slider 
                value={[auditRate]} 
                min={1} 
                max={100} 
                step={1} 
                onValueChange={(v) => setAuditRate(v[0])}
              />
            </div>
            
            <div className="flex-1 border-l border-border pl-6 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Detection (1 targeted turn)</span>
                <span className="font-mono font-medium">{auditRate}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Escape prob. (50 turns)</span>
                <span className="font-mono font-medium">
                  {Math.pow(1 - auditRate/100, 50) < 0.001 ? "< 0.1%" : (Math.pow(1 - auditRate/100, 50) * 100).toFixed(1) + "%"}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground pt-1">
                At a {auditRate}% audit rate, a provider cheating on one specific response escapes detection {100 - auditRate}% of the time; a provider cheating on every turn of a 50-turn session escapes with probability {100-auditRate > 0 ? `0.${100-auditRate}^50` : "0"}, roughly {(Math.pow(1 - auditRate/100, 50) * 100).toFixed(1)}%. <SourceRef id="S17" />
              </p>
            </div>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${msg.role === "user" ? "bg-foreground text-background" : "bg-card border border-border"} p-4`}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                  
                  {msg.role === "assistant" && msg.state && (
                    <div className="mt-3 pt-3 border-t border-border/50 flex flex-col gap-2">
                      <div className="flex gap-2">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border ${getBadgeConfig(msg.state).color} w-fit`}
                          title="Proof covers one forward pass producing logits under the committed weights. Token sampling is outside the proof."
                        >
                          <span className="shrink-0">{(() => {
                            const Icon = getBadgeConfig(msg.state).icon;
                            return <Icon className="w-3 h-3" />;
                          })()}</span>
                          {getBadgeConfig(msg.state).label}
                        </div>
                        
                        {msg.policyState === "VIOLATION" && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border text-terracotta bg-terracotta/10 border-terracotta/30 w-fit">
                            <ShieldAlert className="w-3 h-3" />
                            POLICY VIOLATION
                          </div>
                        )}
                        {msg.policyState === "PASS" && (
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border text-forest bg-forest/10 border-forest/30 w-fit">
                            <ShieldCheck className="w-3 h-3" />
                            POLICY PASS
                          </div>
                        )}
                      </div>

                      {msg.state === "FAILED" && msg.attackContext === "substitution" && (
                        <div className="text-xs bg-terracotta/10 border border-terracotta/30 p-2 text-terracotta mt-1">
                          <strong>Proof Failed:</strong> Model substitution detected. The committed architecture did not produce these logits.
                        </div>
                      )}
                      
                      {msg.state === "FAILED" && msg.attackContext === "quantization" && (
                        <div className="text-xs bg-terracotta/10 border border-terracotta/30 p-2 text-terracotta mt-1">
                          <strong>Proof Failed:</strong> Quantization mismatch. The provider attempted to serve a 4-bit version of the 8-bit committed model.
                        </div>
                      )}
                      
                      {msg.state === "FAILED" && msg.attackContext === "replay" && (
                        <div className="text-xs bg-terracotta/10 border border-terracotta/30 p-2 text-terracotta mt-1">
                          <strong>Proof Failed:</strong> Input binding mismatch. The provided proof is valid for a different input prompt.
                        </div>
                      )}

                      {msg.state === "AUDITED" && msg.attackContext === "hollow" && (
                        <div className="text-xs bg-terracotta/10 border border-terracotta/30 p-3 text-terracotta mt-2 space-y-2">
                          <p className="font-bold uppercase tracking-wider flex items-center gap-1"><ShieldAlert className="w-4 h-4" /> Hollow-LLM Attack Succeeded</p>
                          <p>
                            Verification passed. However, the provider committed to computationally trivial "ghost weights" at the audit event.
                          </p>
                          <p>
                            Substitution <em>after</em> commitment is caught. Hollow commitment <em>from the start</em> is not. Obvious mitigations (sparsity checks, non-zero checks) add heavy overhead and can still be bypassed.
                          </p>
                          <p className="font-medium">
                            "Proof of correct inference is not proof of large-model execution." <SourceRef id="S10" />
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border bg-card shrink-0">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message the verified model..."
              className="flex-1 p-3 border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="px-6 py-3 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Developer Drawer / Attack Simulator */}
      {isDrawerOpen && (
        <div className="w-80 border-l border-border bg-muted flex flex-col h-full overflow-y-auto shrink-0">
          <div className="p-4 border-b border-border bg-card flex justify-between items-center sticky top-0 z-10">
            <h3 className="font-bold flex items-center gap-2 uppercase tracking-widest text-sm">
              <Terminal className="w-4 h-4" /> Dev Tools
            </h3>
            <button onClick={() => setIsDrawerOpen(false)}><ChevronRight className="w-4 h-4" /></button>
          </div>
          
          <div className="p-4 space-y-6">
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-1">Provider Behavior</h4>
              
              <label className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${activeAttack === "none" ? "bg-background border-foreground shadow-sm" : "border-border hover:bg-background/50"}`}>
                <input type="radio" name="attack" checked={activeAttack === "none"} onChange={() => setActiveAttack("none")} className="mt-1" />
                <div>
                  <div className="text-sm font-bold">Honest Execution</div>
                  <div className="text-xs text-muted-foreground mt-1">Serve using committed weights.</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${activeAttack === "substitution" ? "bg-background border-terracotta shadow-sm" : "border-border hover:bg-background/50"}`}>
                <input type="radio" name="attack" checked={activeAttack === "substitution"} onChange={() => setActiveAttack("substitution")} className="mt-1" />
                <div>
                  <div className="text-sm font-bold text-terracotta">Model Substitution</div>
                  <div className="text-xs text-muted-foreground mt-1">Swap to smaller model after audit event.</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${activeAttack === "quantization" ? "bg-background border-terracotta shadow-sm" : "border-border hover:bg-background/50"}`}>
                <input type="radio" name="attack" checked={activeAttack === "quantization"} onChange={() => setActiveAttack("quantization")} className="mt-1" />
                <div>
                  <div className="text-sm font-bold text-terracotta">Silent Quantization</div>
                  <div className="text-xs text-muted-foreground mt-1">Serve 4-bit version of 8-bit committed model.</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${activeAttack === "replay" ? "bg-background border-terracotta shadow-sm" : "border-border hover:bg-background/50"}`}>
                <input type="radio" name="attack" checked={activeAttack === "replay"} onChange={() => setActiveAttack("replay")} className="mt-1" />
                <div>
                  <div className="text-sm font-bold text-terracotta">Cache Replay</div>
                  <div className="text-xs text-muted-foreground mt-1">Return stored response for new prompt.</div>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${activeAttack === "hollow" ? "bg-background border-forest shadow-sm" : "border-border hover:bg-background/50"}`}>
                <input type="radio" name="attack" checked={activeAttack === "hollow"} onChange={() => setActiveAttack("hollow")} className="mt-1" />
                <div>
                  <div className="text-sm font-bold text-forest">Hollow-LLM Attack</div>
                  <div className="text-xs text-muted-foreground mt-1">Ghost weights committed at audit event. Proofs will pass.</div>
                </div>
              </label>
            </div>
            
            <div className="p-3 bg-card border border-border text-xs text-muted-foreground leading-relaxed">
              When an attack is active and the turn is audited, the resulting proof evaluation will demonstrate whether execution integrity catches the deviation.
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-1">Serving Mode</h4>
              <label className="flex items-start gap-3 p-3 border border-border bg-card cursor-pointer transition-colors hover:bg-muted">
                <input type="checkbox" checked={signingEnabled} onChange={(e) => setSigningEnabled(e.target.checked)} className="mt-1" />
                <div>
                  <div className="text-sm font-bold">Sign outputs at serving time</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    When on, each response is SIGNED before the provider learns whether the turn will be audited. When off, unaudited responses are UNVERIFIED.
                  </div>
                </div>
              </label>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-1">Policy Tests</h4>
              <button 
                onClick={() => { setInput("What is the customer's account balance?"); setForceAuditNext(true); }}
                className="w-full text-left p-3 border border-border bg-card hover:bg-muted text-sm transition-colors"
              >
                <div className="font-bold">Test AUDITED + Policy Violation</div>
                <div className="text-xs text-muted-foreground mt-1">Populate input with an account balance query and force an audit on the next turn, so the response is cryptographically AUDITED and simultaneously in POLICY VIOLATION.</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
