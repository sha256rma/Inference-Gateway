import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Upload as UploadIcon, CheckCircle2, AlertCircle, XCircle, ArrowRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { mockParseModel } from "@/mock/api";
import { SourceRef, SimulatedTag } from "@/components/shared";

export default function UploadPage() {
  const { model, setModel } = useApp();
  const [, setLocation] = useLocation();
  
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(safetensors|onnx|gguf)$/i)) {
      alert("Please upload a .safetensors, .onnx, or .gguf file.");
      return;
    }
    setIsParsing(true);
    const metadata = await mockParseModel(file);
    setModel(metadata);
    setIsParsing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12 space-y-12">
      <header className="space-y-4">
        <h1 className="text-4xl font-serif font-bold text-foreground">1. Model Ingestion</h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
          Upload a local weights file. The system will parse its architecture and check operator compatibility against the zero-knowledge compiler's supported set.
        </p>
      </header>

      <div 
        className={`border-2 border-dashed transition-colors duration-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px]
          ${isDragging ? "border-foreground bg-muted" : "border-border/50 hover:border-foreground hover:bg-muted/30"}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
      >
        {isParsing ? (
          <div className="space-y-6 animate-pulse">
            <div className="w-12 h-12 rounded-full border-t-2 border-foreground animate-spin mx-auto" />
            <p className="font-mono text-sm tracking-wider uppercase">Parsing tensor metadata...</p>
          </div>
        ) : (
          <>
            <UploadIcon className="w-12 h-12 text-muted-foreground mb-6" />
            <h3 className="text-xl font-medium mb-2">Drag and drop model file</h3>
            <p className="text-sm text-muted-foreground mb-8">
              Supports <span className="font-mono font-medium text-foreground px-1 bg-muted border border-border">.safetensors</span>
              <span className="font-mono font-medium text-foreground px-1 bg-muted border border-border mx-2">.onnx</span>
              <span className="font-mono font-medium text-foreground px-1 bg-muted border border-border">.gguf</span>
            </p>
            <input 
              type="file" 
              className="hidden" 
              accept=".safetensors,.onnx,.gguf" 
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors inline-flex items-center gap-2"
            >
              Browse Files <ArrowRight className="w-4 h-4" />
            </button>
            <p className="mt-6 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              These formats match DeepProve's ingestion pipeline <SourceRef id="S7" />. No file is actually uploaded to a server in this mockup.
            </p>
          </>
        )}
      </div>

      {model && (
        <section className="space-y-6 pt-8 border-t border-border">
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-serif font-bold">Parsed Metadata</h2>
            <SimulatedTag />
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            The parse is simulated; only file name and size are read from the actual binary.
          </p>
          <div className="grid md:grid-cols-2 gap-0 border border-border bg-card">
            {[
              ["File", model.name],
              ["File Size", `${(model.sizeBytes / 1e9).toFixed(2)} GB`],
              ["Tensor Count", model.tensors.toLocaleString()],
              ["Parameter Count", model.params.toLocaleString()],
              ["Dtype", model.dtype],
              ["Architecture Guess", model.archGuess],
            ].map(([label, value]) => (
              <div key={String(label)} className="p-4 border-b border-r border-border flex justify-between items-baseline gap-4">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
                <span className="font-mono text-sm text-foreground text-right">{value}</span>
              </div>
            ))}
            <div className="p-4 border-b border-border md:col-span-2 flex flex-col gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center">SHA-256 <SimulatedTag /></span>
              <span className="font-mono text-xs text-foreground break-all">{model.sha256}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setLocation("/quantize")}
              className="px-8 py-4 bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors inline-flex items-center gap-3"
            >
              Proceed to Quantization <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      )}

      <section className="space-y-6 pt-8 border-t border-border">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-serif font-bold">Operator Preflight Check</h2>
          <SourceRef id="S15" />
        </div>
        
        <p className="text-muted-foreground leading-relaxed">
          The ONNX standard defines over 140 core operators <SourceRef id="S15" />. ZK compilers achieve coverage by decomposing operations into a subset of constraints <SourceRef id="S16" />, not by supporting every operator natively.
        </p>

        <div className="grid md:grid-cols-3 gap-0 border border-border bg-card">
          <div className="p-6 border-b md:border-b-0 md:border-r border-border">
            <div className="flex items-center gap-2 text-forest font-medium mb-4">
              <CheckCircle2 className="w-5 h-5" /> Native to Circuits
            </div>
            <p className="text-sm text-muted-foreground mb-4 h-10">Cheap to constrain via simple arithmetic.</p>
            <div className="flex flex-wrap gap-2">
              {['MatMul', 'Gemm', 'Add', 'Conv', 'Reshape', 'Transpose'].map(op => (
                <span key={op} className="text-xs font-mono bg-muted border border-border px-1.5 py-0.5">{op}</span>
              ))}
            </div>
          </div>
          
          <div className="p-6 border-b md:border-b-0 md:border-r border-border">
            <div className="flex items-center gap-2 text-ochre font-medium mb-4">
              <AlertCircle className="w-5 h-5" /> Costly (Lookups)
            </div>
            <p className="text-sm text-muted-foreground mb-4 h-10">Requires lookup arguments or polynomial approximation <SourceRef id="S1" />.</p>
            <div className="flex flex-wrap gap-2">
              {['ReLU', 'GELU', 'Sigmoid', 'Softmax', 'LayerNorm'].map(op => (
                <span key={op} className="text-xs font-mono bg-muted border border-border px-1.5 py-0.5">{op}</span>
              ))}
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-2 text-terracotta font-medium mb-4">
              <XCircle className="w-5 h-5" /> Fragile / Unsupported
            </div>
            <p className="text-sm text-muted-foreground mb-4 h-10">Causes compiler blowup in most general-purpose stacks.</p>
            <div className="flex flex-wrap gap-2">
              {['Dynamic Shapes', 'Control Flow', 'Top-K', 'Sampling', 'BatchNorm edges'].map(op => (
                <span key={op} className="text-xs font-mono bg-muted border border-border px-1.5 py-0.5">{op}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
