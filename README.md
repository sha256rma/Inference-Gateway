# SPOT: Secure Inference Gateway

You cannot tell which model is actually running behind an AI agent. It runs on
someone else's server, and a provider has a commercial reason to swap in
something smaller or compressed: it costs far less GPU and may reason worse.
Careful reasoning is what you were paying for.

What exists today is a provider dashboard telling you which model you got. The
provider is the root of trust, and they are also the party you would be
disputing with. The alternative has always been to hand over the weights, which
no lab will do.

## The design

SPOT sits between the agent and the model.

1. **Commit once.** At an audit event the provider commits to their exact
   weights and publishes the hash alongside the model's test scores.
2. **Receipt per call.** Every inference afterwards carries a receipt binding
   the request, the decision, and that commitment. Cheap, checked in
   milliseconds.
3. **Prove on a sample.** A sampled subset carries a full zero-knowledge proof
   that the committed weights produced that exact output. The lab keeps its
   weights, the user gets a proof.

The sample is drawn from Bitcoin block hashes, so neither the user nor the
provider can predict or rig which calls get audited.

Prototyped against open-weight models, which can be audited end to end without
a lab's cooperation.

## Status

Working mockup, not a production gateway. Live at
[inference-gateway.replit.app](https://inference-gateway.replit.app).

- `artifacts/api-server/` TypeScript service exposing the gateway routes.
- `artifacts/mockup-sandbox/` React front end demonstrating session validation.

Built with pnpm. `pnpm install`, then `pnpm run build`.

## Caveat worth stating

Unriggable sampling is not the same as covering sampling. A sample drawn from a
source neither party controls is fair, but fairness says nothing about how much
of the output space a fixed number of draws can see. That distinction, and what
it costs to close, is written up in
[Your Spot Check Cannot See the Fault You Are Paid to Catch](https://sha512rma.eth.limo/blog/fiat-shamir-coverage-gap).
