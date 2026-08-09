export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockParseModel(file: File) {
  await delay(1500);
  return {
    name: file.name,
    sizeBytes: file.size || 4_200_000_000,
    tensors: 291,
    params: 1_200_000_000,
    dtype: "fp16",
    archGuess: "LLaMA-like",
    sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  };
}

export async function mockCompile(scale: number, system: string) {
  await delay(2000);
  return {
    constraints: 2_450_102 + (scale === 24 ? 1_000_000 : 0),
    adviceColumns: system === "halo2" ? 43 : 0,
    lookupTable: scale === 16 ? 65_536 : 256,
    provingKeySize: system === "halo2" ? "2.4 GB" : (system === "gkr" ? "0 MB (Setup-free)" : "1.2 GB"),
    verificationKeySize: system === "groth16" ? "4 KB" : "120 KB",
    estProvingTime: system === "gkr" ? "3.2 mins" : "4.5 hours",
    peakMemory: system === "halo2" ? "64 GB" : "12 GB"
  };
}

export async function mockComputeCommitment() {
  await delay(2500);
  return "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
}

export async function mockPublishLog() {
  await delay(1500);
  return {
    index: Math.floor(Math.random() * 100000) + 50000,
    merkleRoot: "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('')
  };
}

export async function mockGenerateProof(turns: number) {
  // Proving time increases slightly with turns but is always mock-fast
  await delay(1500 + Math.random() * 1000);
  return true; // Proof passes
}
