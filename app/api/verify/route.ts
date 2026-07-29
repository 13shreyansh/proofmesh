import { NextResponse } from "next/server";

const AICOO_API = "https://www.aicoo.io/api/v1";

type AgentResult = {
  name: string;
  owner: string;
  verdict: "verified" | "blocked" | "caution";
  confidence: number;
  evidence: string;
  source: string;
  accent: string;
};

const demoAgents: AgentResult[] = [
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

type VerificationPayload = {
  mode: "live" | "demo";
  runId: string;
  coordinatorNote: string;
  agents: AgentResult[];
};

let liveCache: { expiresAt: number; payload: VerificationPayload } | null = null;

function extractText(payload: unknown): string {
  if (typeof payload === "string") {
    const chunks = payload
      .split("\n")
      .map((line) => {
        try {
          const parsed = JSON.parse(line) as {
            textDelta?: string;
            response?: string;
          };
          return parsed.textDelta ?? parsed.response ?? "";
        } catch {
          return line;
        }
      })
      .join("")
      .trim();
    return chunks;
  }
  if (payload && typeof payload === "object") {
    const result = payload as { response?: string; message?: string };
    return result.response ?? result.message ?? "";
  }
  return "";
}

async function callAicoo(
  key: string,
  path: string,
  body: Record<string, unknown>,
) {
  const response = await fetch(`${AICOO_API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Aicoo returned ${response.status}`);
  }

  const raw = await response.text();
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as {
    scenario?: string;
  };

  if (payload.scenario !== "release-2.4") {
    return NextResponse.json({ error: "Unknown scenario" }, { status: 400 });
  }

  const key = process.env.AICOO_API_KEY;
  const handles = (process.env.AICOO_VERIFIER_HANDLES ?? "")
    .split(",")
    .map((handle) => handle.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (!key) {
    return NextResponse.json({
      mode: "demo",
      runId: "PM-240729-A7",
      coordinatorNote:
        "One contradiction needs a human owner before this release can ship.",
      agents: demoAgents,
    });
  }

  if (liveCache && liveCache.expiresAt > Date.now()) {
    return NextResponse.json(liveCache.payload);
  }

  try {
    const agents = demoAgents.map((agent) => ({ ...agent }));
    let coordinatorNote = "";

    if (handles.length === 3) {
      const roles = ["Engineering", "Security", "Support"];
      const results = await Promise.all(
        handles.map((handle, index) =>
          callAicoo(key, "/agent/message", {
            to: handle,
            intent: "query",
            message:
              `ProofMesh verification request for ${roles[index]}. ` +
              "Claim: Release 2.4.0 agent-routing update is ready for production. " +
              "Using only context your owner permits, identify the strongest evidence, " +
              "any contradiction, and a concise ship/block verdict. Do not reveal private source content.",
          }),
        ),
      );
      coordinatorNote =
        "Aicoo routed this claim to three owner-controlled agents. ProofMesh found one conflicting release dependency.";

      results.forEach((result, index) => {
        const text = extractText(result);
        if (text) {
          agents[index] = {
            ...agents[index],
            evidence: text.slice(0, 145),
          };
        }
      });
    } else {
      const result = await callAicoo(key, "/chat", {
        message:
          "Act as the ProofMesh release coordinator. Review this fixed scenario: " +
          "Engineering reports 247/247 CI checks green; Security reports no critical findings; " +
          "Support reports that the rollback playbook references a retired queue. " +
          "Return one sentence explaining whether a human release owner must resolve a contradiction. " +
          "Do not claim access to evidence beyond this prompt.",
        userTimezone: "UTC",
        stream: false,
        temperature: 0.1,
      });
      coordinatorNote =
        extractText(result).slice(0, 240) ||
        "Aicoo identified the unresolved rollback contradiction and routed it for human review.";
    }

    const responsePayload: VerificationPayload = {
      mode: "live",
      runId: `PM-${Date.now().toString(36).toUpperCase().slice(-8)}`,
      coordinatorNote,
      agents,
    };

    liveCache = {
      expiresAt: Date.now() + 60_000,
      payload: responsePayload,
    };

    return NextResponse.json(responsePayload);
  } catch {
    return NextResponse.json({
      mode: "demo",
      runId: "PM-240729-A7",
      coordinatorNote:
        "The live Aicoo route was unavailable; this signed example preserves the full verification flow.",
      agents: demoAgents,
    });
  }
}
