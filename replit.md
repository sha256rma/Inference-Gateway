# Verified Inference Gateway

## Overview
A single-page, frontend-only research demonstrator of verifiable AI inference (zkML), built to the uploaded brief in `attached_assets/Pasted--Build-prompt-Verified-Inference-Gateway-research-demon_1786273437610.txt`. Audience: cryptography and AI safety researchers. Everything is simulated (no real crypto, model serving, or proving), but all stated guarantees and literature numbers are accurate and sourced.

## Structure
- `artifacts/verified-inference-gateway/` — React + Vite + TS app served at `/` (workflow `artifacts/verified-inference-gateway: web`).
  - `src/context/AppContext.tsx` — in-memory state machine carrying one model through the pipeline (no localStorage by design).
  - `src/mock/api.ts` — simulated async operations (parse, compile, commitment, proof generation).
  - `src/mock/sources.ts` — Source Register S1–S22 (+S17a); wired to `SourceRef` tooltips.
  - `src/components/shared.tsx` — `SourceRef` tooltip and `SIMULATED` tag components.
  - `src/pages/` — Upload, Quantize, Audit, Chat (with attack simulator drawer), Lean, Training, Limits.

## Key conventions (from the brief — do not violate)
- Honesty mandate: proofs certify execution integrity only; use the word "authentic", never "safe"/"aligned"/"trustworthy".
- Every fabricated cryptographic value carries a `SIMULATED` tag; compressed timings show a `TIME COMPRESSED` label.
- Design: editorial/Bauhaus — Charcoal/Cream/Terracotta/Forest/Ochre palette, Playfair Display + Inter + JetBrains Mono, 1px rules, no gradients/glassmorphism/emoji/shadows, zero border radius.
- No backend, no localStorage/sessionStorage, no login/billing/settings.

## User preferences
(none recorded yet)
