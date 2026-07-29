# ProofMesh

**Ship only what every team's agent can prove.**

ProofMesh is an Aicoo-native release verification protocol. It asks
owner-controlled agents across Engineering, Security, and Support to verify a
launch claim independently, reconciles their evidence, and escalates only the
unresolved contradiction to a human release owner.

Built for the AICOO HACKATHON 2026.

## Try it

- [Interactive demo](https://proofmesh-aicoo.vercel.app/)
- [Two-minute product walkthrough](submission/proofmesh-demo.mp4)

## Why it exists

Critical launches usually end in a status meeting because no one system can
safely inspect every team's private context. ProofMesh preserves that boundary:
each Aicoo agent answers from the context its owner permits, while the
coordinator compares verdicts and keeps a proof-linked decision record.

## Aicoo integration

The server-side verification route supports:

- `POST /api/v1/agent/message` for synchronous, permissioned agent-to-agent RPC
  when three verifier handles are configured.
- `POST /api/v1/chat` for Aicoo-coordinated analysis when verifier handles are
  not configured.
- A deterministic signed demo case when no API key is available, so reviewers
  can inspect the complete interaction without credentials.

The interface also shows how `/accumulate` and `/tools` fit into the production
protocol for durable records and tool discovery.

## Local development

```bash
npm install
npm run dev
```

Optional environment variables:

```bash
AICOO_API_KEY=your_server_side_key
AICOO_VERIFIER_HANDLES=engineering_coo,security_coo,support_coo
```

`AICOO_API_KEY` is read only by the server route and must never be exposed to
the browser or committed.

## Validation

```bash
npm run lint
npm run build
```
