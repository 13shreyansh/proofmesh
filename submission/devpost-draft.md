# ProofMesh

## One-sentence summary

ProofMesh is a permission-scoped release gate that asks user-owned Aicoo agents
to independently verify launch evidence, reconciles conflicts, and escalates
only the unresolved decision to a human.

## Inspiration

Release decisions routinely collapse into status meetings because Engineering,
Security, and Support each hold a different piece of the truth. Centralizing
all of that context is slow, invasive, and often impossible. We wanted a way to
verify a launch claim without taking control away from the people who own the
underlying evidence.

## What it does

ProofMesh turns a release claim into precise verification requests and routes
them to the relevant team agents. Each agent answers independently from only
the context its owner has permitted. ProofMesh compares the verdicts, preserves
links to supporting evidence, surfaces contradictions, and asks a human release
owner to resolve only the remaining edge case. The final decision is sealed in
a proof ledger.

The demo follows one complete case:

1. Engineering verifies that 247/247 CI checks passed.
2. Security verifies that there are no critical findings.
3. Support blocks the release because the rollback playbook names a retired
   queue.
4. ProofMesh escalates that contradiction instead of pretending consensus.
5. The release owner updates the playbook and seals an accountable decision.

## Who it is for

Release managers and fast-moving engineering teams that need to make high-risk
launch decisions across organizational boundaries without pooling every
team's private context.

## How we built it

ProofMesh is a Next.js/Vinext application with a server-side Aicoo integration.
When verifier handles are configured, it sends synchronous, idempotent requests
to three owner-controlled agents using `POST /api/v1/agent/message`. When those
contacts are not available, the same route uses `POST /api/v1/chat` for the
Aicoo coordinator. The public review experience includes a deterministic signed
case so judges can inspect the full workflow without credentials.

The production protocol also maps evidence records to `/accumulate` and uses
`/tools` discovery for connected systems. The Aicoo key stays server-side and
never reaches the browser.

## Why Aicoo is essential

ProofMesh is not a chatbot wrapper. Its core premise depends on Aicoo's
owner-controlled agent network: one agent can ask another agent a bounded
question, while the recipient acts only within permissions its owner granted.
That lets ProofMesh coordinate a decision without copying private source
context into a central database. Aicoo provides the routing, context boundary,
agent execution, and durable workspace model that make the protocol possible.

## Using AI COO for the build

TO FINALIZE AFTER LIVE AICOO SETUP: describe the exact planning or project
management task completed with Aicoo's COO.

## Challenges we ran into

The hardest product decision was resisting false consensus. A release gate that
always returns green would look smooth but be dangerous. We designed the proof
score, evidence references, and human escalation together so disagreement is a
first-class outcome rather than a failure state.

We also made the Aicoo integration credential-safe and reviewable: live routing
happens on the server, while the fixed public case prevents a judge from
needing an API key or triggering arbitrary model usage.

## Accomplishments that we're proud of

- A complete, interactive claim-to-decision workflow.
- Aicoo-native agent routing with owner-controlled context boundaries.
- An explicit contradiction path and accountable human resolution.
- A proof ledger that makes each verdict and decision explainable.
- A polished, responsive demo that works without reviewer setup.

## What we learned

Multi-agent products become more trustworthy when they pass intent and evidence
references—not authority—between agents. The best orchestration layer is not
the one that sees everything; it is the one that asks the smallest useful
question and knows when to escalate.

## What's next

- Write decision records into the Aicoo workspace with `/accumulate`.
- Add reusable verification policies for releases, vendor approvals, and
  incident recovery.
- Support group deliberation for cross-functional launch rooms.
- Add cryptographic signatures and revocation-aware evidence links.
- Measure escaped-release risk and human decision latency over time.

## Links

- Demo: TO ADD AFTER PUBLIC DEPLOYMENT
- Code: TO ADD AFTER REPOSITORY PUBLICATION
- Demo video: TO ADD AFTER RECORDING

## Team

- Shreyansh Agarwal — solo builder
