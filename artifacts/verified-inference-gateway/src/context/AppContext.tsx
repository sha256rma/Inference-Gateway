import { createContext, useContext, useState, ReactNode } from "react";

export type Stage = "upload" | "quantize" | "audit" | "chat";

export interface ModelMetadata {
  name: string;
  sizeBytes: number;
  tensors: number;
  params: number;
  dtype: string;
  archGuess: string;
  sha256: string;
}

export interface CompilationData {
  scale: number;
  provingSystem: "halo2" | "groth16" | "gkr";
  constraints: number;
  adviceColumns: number;
  lookupTable: number;
  provingKeySize: string;
  verificationKeySize: string;
  estProvingTime: string;
  peakMemory: string;
}

export interface PassportData {
  commitment: string;
  circuitHash: string;
  auditDate: string;
  auditors: number;
  transparencyIndex: number;
  merkleRoot: string;
}

interface AppState {
  stage: Stage;
  model: ModelMetadata | null;
  compilation: CompilationData | null;
  passport: PassportData | null;
}

interface AppContextType extends AppState {
  setModel: (model: ModelMetadata | null) => void;
  setCompilation: (compilation: CompilationData | null) => void;
  setPassport: (passport: PassportData | null) => void;
  setStage: (stage: Stage) => void;
  reset: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    stage: "upload",
    model: null,
    compilation: null,
    passport: null,
  });

  return (
    <AppContext.Provider
      value={{
        ...state,
        setModel: (model) => setState((s) => ({ ...s, model, stage: "quantize" })),
        setCompilation: (compilation) => setState((s) => ({ ...s, compilation, stage: "audit" })),
        setPassport: (passport) => setState((s) => ({ ...s, passport, stage: "chat" })),
        setStage: (stage) => setState((s) => ({ ...s, stage })),
        reset: () => setState({ stage: "upload", model: null, compilation: null, passport: null }),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
