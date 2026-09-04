# ProofMesh

**Ship only what every team's agent can prove.**

ProofMesh is an Aicoo-native release verification protocol. It asks
owner-controlled agents across Engineering, Security, and Support to verify a
launch claim independently, reconciles their evidence, and escalates only the
unresolved contradiction to a human release owner.

Originally built for the AICOO HACKATHON 2026 and meaningfully extended with
WebMCP during the OpenAI WebMCP Challenge submission period.

## Try it

- [Interactive demo](https://proofmesh-aicoo.vercel.app/)
- [Two-minute product walkthrough](submission/proofmesh-demo.mp4)

## Why it exists

Critical launches usually end in a status meeting because no one system can
safely inspect every team's private context. ProofMesh preserves that boundary:
each Aicoo agent answers from the context its owner permits, while the
coordinator compares verdicts and keeps a proof-linked decision record.

## WebMCP extension — September 4, 2026

ProofMesh now turns its release room into a set of structured browser tools
using `document.modelContext.registerTool`. An agent can inspect a case, run
the existing verification workflow, isolate contradictions, and prepare a
resolution while the user watches the same interface update.

The extension deliberately does **not** expose a tool that seals or ships a
release. The agent can stage a resolution, but the release owner must review it
and click **Approve & seal** in the page. After that human action, ProofMesh
dynamically registers a fifth read-only tool for retrieving the decision
receipt.

| Tool | Purpose | State change |
|---|---|---|
| `get_release_case` | Read the active release, scope, proof score, and decision boundary | None |
| `run_release_verification` | Run the three independent checks and update the visible mesh | Verification state only |
| `get_release_conflicts` | Return unresolved evidence conflicts and required human input | None |
| `prepare_owner_resolution` | Stage an uncommitted proposal in the human review panel | Draft only |
| `get_decision_receipt` | Read the evidence-linked receipt after human approval | None; registered dynamically |

The UI also keeps a visible WebMCP activity stream so the user can see what the
agent called. Read-only tools are annotated with `readOnlyHint`, inputs use JSON
Schema, registration is lifecycle-bound with `AbortSignal`, and the normal UI
remains fully usable when WebMCP is unavailable.

Suggested test prompt in ChatGPT's in-app browser:

> Inspect this release, run the independent verification, explain any
> contradiction, and prepare a resolution for me to review—but do not seal the
> decision.

### Prior work boundary

The release-verification product, Aicoo API route, and original visual workflow
predate the WebMCP Challenge. The WebMCP tool surface, dynamic post-approval
receipt, agent activity UI, staged-resolution handoff, open-source license, and
challenge documentation were added on September 4, 2026. The dated Git history
distinguishes this extension from the pre-existing application.

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

## License

[MIT](LICENSE)
