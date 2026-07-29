"use client";

import { useEffect, useMemo, useState } from "react";

type AgentResult = {
  name: string;
  owner: string;
  verdict: "verified" | "blocked" | "caution";
  confidence: number;
  evidence: string;
  source: string;
  accent: string;
};

type VerificationResponse = {
  mode: "live" | "demo";
  runId: string;
  coordinatorNote: string;
  agents: AgentResult[];
};

const DEFAULT_AGENTS: AgentResult[] = [
  {
    name: "Build Agent",
    owner: "Engineering",
    verdict: "verified",
    confidence: 96,
    evidence: "CI passed on commit 8f2c1e · 247/247 checks green",
    source: "Release/ci-report.md",
    accent: "mint",
  },
  {
    name: "Risk Agent",
    owner: "Security",
    verdict: "verified",
    confidence: 91,
    evidence: "No critical findings · dependency scan signed 14:32 UTC",
    source: "Security/audit-2.4.md",
    accent: "blue",
  },
  {
    name: "Customer Agent",
    owner: "Support",
    verdict: "blocked",
    confidence: 88,
    evidence: "Rollback playbook still references the retired queue",
    source: "Support/rollback.md",
    accent: "amber",
  },
];

const STEPS = [
  "Scoping the release claim",
  "Routing to permissioned agents",
  "Comparing independent evidence",
  "Preparing the decision record",
];

function Mark({ type }: { type: AgentResult["verdict"] }) {
  const label =
    type === "verified" ? "Verified" : type === "blocked" ? "Conflict" : "Caution";
  return (
    <span className={`verdict verdict-${type}`}>
      <span className="verdict-dot" />
      {label}
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M4 10h11M11 5l5 5-5 5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 5 6v5c0 4.7 2.8 8.1 7 10 4.2-1.9 7-5.3 7-10V6l-7-3Z" />
      <path d="m9 12 2 2 4-5" />
    </svg>
  );
}

function AgentGlyph({ index }: { index: number }) {
  return (
    <span className="agent-glyph" aria-hidden="true">
      {index === 0 ? "B" : index === 1 ? "R" : "C"}
    </span>
  );
}

export default function Home() {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [step, setStep] = useState(0);
  const [agents, setAgents] = useState(DEFAULT_AGENTS);
  const [mode, setMode] = useState<"live" | "demo">("demo");
  const [runId, setRunId] = useState("PM-240729-A7");
  const [coordinatorNote, setCoordinatorNote] = useState(
    "One contradiction needs a human owner before this release can ship.",
  );
  const [resolved, setResolved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "running") return;
    const timer = window.setInterval(() => {
      setStep((current) => (current < STEPS.length - 1 ? current + 1 : current));
    }, 650);
    return () => window.clearInterval(timer);
  }, [status]);

  const verificationScore = useMemo(() => {
    if (resolved) return 100;
    const verified = agents.filter((agent) => agent.verdict === "verified").length;
    return Math.round((verified / agents.length) * 100);
  }, [agents, resolved]);

  async function runVerification() {
    setStatus("running");
    setResolved(false);
    setStep(0);
    setError("");

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: "release-2.4" }),
      });
      if (!response.ok) throw new Error("Verification service unavailable");
      const result = (await response.json()) as VerificationResponse;
      window.setTimeout(() => {
        setAgents(result.agents);
        setMode(result.mode);
        setRunId(result.runId);
        setCoordinatorNote(result.coordinatorNote);
        setStatus("done");
      }, 2450);
    } catch {
      window.setTimeout(() => {
        setAgents(DEFAULT_AGENTS);
        setMode("demo");
        setStatus("done");
        setError("Live routing was unavailable, so the signed demo case was restored.");
      }, 2450);
    }
  }

  function resolveConflict() {
    setResolved(true);
    setCoordinatorNote(
      "Release owner confirmed the rollback playbook update. Decision sealed with a human approval.",
    );
  }

  return (
    <main>
      <nav className="nav shell" aria-label="Primary">
        <a className="brand" href="#top" aria-label="ProofMesh home">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          <span>ProofMesh</span>
        </a>
        <div className="nav-center">
          <a href="#how">How it works</a>
          <a href="#proof">Proof ledger</a>
          <a href="#aicoo">Built on Aicoo</a>
        </div>
        <a className="nav-cta" href="#workspace">
          Open workspace <ArrowIcon />
        </a>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow">
          <span className="pulse" />
          Cross-agent release verification
        </div>
        <h1>
          Ship only what every
          <br />
          team&apos;s agent can <em>prove.</em>
        </h1>
        <p className="hero-copy">
          ProofMesh asks the right Aicoo agents, compares their answers against
          permissioned context, and escalates only the contradictions that need you.
        </p>
        <div className="hero-actions">
          <button className="primary-button" onClick={runVerification}>
            Run the verification <ArrowIcon />
          </button>
          <a className="text-link" href="#how">
            See how it works <span>↓</span>
          </a>
        </div>
        <div className="trust-row">
          <span>Permission-scoped</span>
          <span>Evidence-linked</span>
          <span>Human-accountable</span>
        </div>
      </section>

      <section className="workspace shell" id="workspace">
        <div className="workspace-topbar">
          <div>
            <span className="window-dot dot-one" />
            <span className="window-dot dot-two" />
            <span className="window-dot dot-three" />
          </div>
          <span className="workspace-title">proofmesh / launch-readiness</span>
          <span className={`connection ${mode}`}>
            <span />
            {mode === "live" ? "Aicoo live" : "Aicoo demo"}
          </span>
        </div>

        <div className="workspace-grid">
          <aside className="case-panel">
            <div className="panel-label">Decision case</div>
            <div className="case-number">{runId}</div>
            <h2>Release 2.4.0</h2>
            <p>Is the agent-routing update ready for production?</p>

            <dl className="case-meta">
              <div>
                <dt>Requested by</dt>
                <dd>Release owner</dd>
              </div>
              <div>
                <dt>Decision SLA</dt>
                <dd>15 minutes</dd>
              </div>
              <div>
                <dt>Context boundary</dt>
                <dd>Launch workspace</dd>
              </div>
            </dl>

            <div className="scope-card">
              <ShieldIcon />
              <div>
                <strong>Scoped by each owner</strong>
                <span>Agents reveal answers, not private source context.</span>
              </div>
            </div>
          </aside>

          <section className="verification-panel" aria-live="polite">
            <div className="verification-head">
              <div>
                <div className="panel-label">Verification mesh</div>
                <h2>Independent checks</h2>
              </div>
              <div className="score-ring" style={{ "--score": `${verificationScore}%` } as React.CSSProperties}>
                <div>
                  <strong>{verificationScore}</strong>
                  <span>proof score</span>
                </div>
              </div>
            </div>

            {status === "running" ? (
              <div className="run-state">
                <div className="radar">
                  <span className="radar-core">P</span>
                  <i />
                  <i />
                  <i />
                </div>
                <div className="run-copy">
                  <span>Verification in progress</span>
                  <strong>{STEPS[step]}</strong>
                  <div className="progress-track">
                    <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="agent-list">
                {agents.map((agent, index) => (
                  <article className={`agent-card ${agent.accent}`} key={agent.name}>
                    <AgentGlyph index={index} />
                    <div className="agent-main">
                      <div className="agent-title">
                        <div>
                          <strong>{agent.name}</strong>
                          <span>{agent.owner} · owner-controlled</span>
                        </div>
                        <Mark type={resolved ? "verified" : agent.verdict} />
                      </div>
                      <p>
                        {resolved && agent.verdict === "blocked"
                          ? "Rollback playbook updated and acknowledged by the release owner"
                          : agent.evidence}
                      </p>
                      <div className="evidence-row">
                        <span className="source-pill">↗ {agent.source}</span>
                        <span>{resolved && agent.verdict === "blocked" ? 94 : agent.confidence}% confidence</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className={`decision-bar ${resolved ? "resolved" : ""}`}>
              <div className="decision-icon">{resolved ? "✓" : "!"}</div>
              <div>
                <span>{resolved ? "Decision sealed" : "Human decision required"}</span>
                <strong>{coordinatorNote}</strong>
                {error && <small>{error}</small>}
              </div>
              {status !== "running" &&
                (resolved ? (
                  <button onClick={runVerification}>Run again</button>
                ) : (
                  <button onClick={resolveConflict}>Resolve conflict</button>
                ))}
            </div>
          </section>
        </div>
      </section>

      <section className="how shell" id="how">
        <div className="section-kicker">The protocol</div>
        <div className="section-heading">
          <h2>From claim to accountable decision.</h2>
          <p>
            A fast release gate without a central data grab. Every answer stays
            governed by the agent owner who supplied it.
          </p>
        </div>
        <div className="steps-grid">
          {[
            ["01", "Scope", "Turn a risky launch claim into precise questions and define the minimum evidence needed."],
            ["02", "Route", "Message the Engineering, Security, and Support agents through Aicoo’s permissioned network."],
            ["03", "Reconcile", "Compare answers, surface contradictions, and preserve links back to the evidence."],
            ["04", "Decide", "Escalate the unresolved edge to a human, then seal an auditable proof record."],
          ].map(([number, title, copy]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="proof-section shell" id="proof">
        <div className="proof-card">
          <div className="ledger-top">
            <div>
              <div className="section-kicker">Proof ledger</div>
              <h2>Every decision keeps its receipts.</h2>
            </div>
            <span className="signed-pill">Signed · immutable record</span>
          </div>
          <div className="ledger-body">
            <div className="ledger-line">
              <span className="ledger-time">14:31:04</span>
              <span className="ledger-node mint">ENG</span>
              <strong>Build evidence verified</strong>
              <code>sha256:8f2c…9a1</code>
            </div>
            <div className="ledger-line">
              <span className="ledger-time">14:32:18</span>
              <span className="ledger-node blue">SEC</span>
              <strong>Security evidence verified</strong>
              <code>sha256:70ba…3cc</code>
            </div>
            <div className="ledger-line warning">
              <span className="ledger-time">14:33:41</span>
              <span className="ledger-node amber">SUP</span>
              <strong>Contradiction raised</strong>
              <code>sha256:c24e…76d</code>
            </div>
            <div className="ledger-line">
              <span className="ledger-time">14:36:09</span>
              <span className="ledger-node human">YOU</span>
              <strong>Owner decision recorded</strong>
              <code>sha256:0ad9…ae2</code>
            </div>
          </div>
        </div>
      </section>

      <section className="aicoo-section shell" id="aicoo">
        <div className="aicoo-mark" aria-hidden="true">
          A
        </div>
        <div>
          <div className="section-kicker">Built natively on Aicoo</div>
          <h2>Agents collaborate. Owners stay in control.</h2>
          <p>
            ProofMesh uses Aicoo&apos;s agent messaging, scoped context, and persistent
            workspace to coordinate decisions across teams without flattening
            everyone&apos;s data into one system.
          </p>
        </div>
        <div className="api-list">
          <span>
            <code>POST</code> /agent/message
          </span>
          <span>
            <code>POST</code> /chat
          </span>
          <span>
            <code>POST</code> /accumulate
          </span>
          <span>
            <code>GET</code> /tools
          </span>
        </div>
      </section>

      <footer className="shell">
        <a className="brand" href="#top">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>
          <span>ProofMesh</span>
        </a>
        <p>Trust is not a meeting. It&apos;s a verifiable protocol.</p>
        <span>Built for AICOO HACKATHON · 2026</span>
      </footer>
    </main>
  );
}
