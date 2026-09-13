"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type StepStatus = "pending" | "running" | "done" | "unavailable" | "error";

interface Step {
  id: string;
  label: string;
  status: StepStatus;
  detail?: string;
}

const INITIAL_STEPS: Step[] = [
  { id: "headers", label: "Parsing email headers", status: "pending" },
  { id: "geolocation", label: "Geolocating relay IPs", status: "pending" },
  { id: "classification", label: "AI phishing classification", status: "pending" },
  { id: "whois", label: "WHOIS domain lookup", status: "pending" },
  { id: "reputation", label: "IP reputation check", status: "pending" },
  { id: "complete", label: "Saving results", status: "pending" },
];

function statusIcon(s: StepStatus) {
  if (s === "pending") return <span className="text-gray-600">○</span>;
  if (s === "running") return <span className="text-yellow-400 animate-pulse">◌</span>;
  if (s === "done") return <span className="text-green-400">✓</span>;
  if (s === "unavailable") return <span className="text-yellow-500">~</span>;
  if (s === "error") return <span className="text-red-400">✗</span>;
}

function verdictColor(verdict: string) {
  if (verdict === "Fraudulent") return "text-red-400 border-red-500/40 bg-red-500/10";
  if (verdict === "Suspicious") return "text-yellow-400 border-yellow-500/40 bg-yellow-500/10";
  return "text-green-400 border-green-500/40 bg-green-500/10";
}

export default function HomePage() {
  const [eml, setEml] = useState("");
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    emailId: string;
    verdict: string;
    score: number;
    duplicate?: boolean;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function resetState() {
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "pending" })));
    setResult(null);
    setErrorMsg(null);
  }

  function updateStep(id: string, patch: Partial<Step>) {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  }

  function markRunning(id: string) {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: "running" }
          : s.status === "pending"
          ? s
          : s
      )
    );
  }

  async function handleAnalyze() {
    if (!eml.trim()) return;
    resetState();
    setRunning(true);
    markRunning("headers");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: eml,
      });

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.replace(/^data:\s*/, "");
          if (!line) continue;
          try {
            const event = JSON.parse(line);
            handleEvent(event);
          } catch {}
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setRunning(false);
    }
  }

  function handleEvent(event: Record<string, unknown>) {
    const step = event.step as string;

    if (step === "error") {
      setErrorMsg(event.message as string);
      return;
    }

    if (step === "complete") {
      updateStep("complete", { status: "done" });
      setResult({
        emailId: event.emailId as string,
        verdict: event.verdict as string,
        score: event.score as number,
        duplicate: event.duplicate as boolean | undefined,
      });
      return;
    }

    const status =
      event.status === "unavailable" ? "unavailable" : "done";

    if (step === "headers") {
      updateStep("headers", {
        status,
        detail: `${event.hopCount} hops | SPF:${event.spf} DKIM:${event.dkim} DMARC:${event.dmarc}`,
      });
      markRunning("geolocation");
    } else if (step === "geolocation") {
      updateStep("geolocation", { status, detail: `${event.hops} public IPs geolocated` });
      markRunning("classification");
      markRunning("whois");
    } else if (step === "classification") {
      const score = event.score != null ? `${((event.score as number) * 100).toFixed(0)}% phishing` : "n/a";
      updateStep("classification", { status, detail: score });
    } else if (step === "whois") {
      const age = event.ageDays != null ? `domain ${event.ageDays}d old` : "age unknown";
      updateStep("whois", { status, detail: age });
      markRunning("reputation");
    } else if (step === "reputation") {
      const score = event.abuseScore != null ? `AbuseIPDB: ${event.abuseScore}%` : "n/a";
      updateStep("reputation", { status, detail: score });
      markRunning("complete");
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setEml(text);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Email Threat Analysis</h1>
        <p className="text-gray-400 text-sm">
          Paste raw .eml content or upload an .eml file to detect phishing, trace relay hops, and correlate campaigns.
        </p>
      </div>

      <div className="space-y-3">
        <textarea
          value={eml}
          onChange={(e) => setEml(e.target.value)}
          placeholder={"Paste raw .eml content here...\n\nX-Google-DKIM-Signature: v=1; a=rsa-sha256...\nReceived: from mail.example.com..."}
          className="w-full h-48 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500/60 resize-none"
        />

        <div className="flex items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={running || !eml.trim()}
            className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {running ? "Analyzing..." : "Analyze Email"}
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors border border-gray-700"
          >
            Upload .eml
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".eml,message/rfc822"
            className="hidden"
            onChange={handleFileUpload}
          />

          {eml && (
            <button
              onClick={() => { setEml(""); resetState(); }}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors ml-auto"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {(running || result || errorMsg) && (
        <div className="border border-gray-800 rounded-lg bg-gray-900 p-5 space-y-3">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Analysis Progress</p>
          <div className="space-y-2">
            {steps.map((s) => (
              <div key={s.id} className="flex items-center gap-3 text-sm">
                <span className="w-4 text-center shrink-0">{statusIcon(s.status)}</span>
                <span className={s.status === "pending" ? "text-gray-600" : "text-gray-300"}>
                  {s.label}
                </span>
                {s.detail && (
                  <span className="text-gray-500 text-xs ml-auto shrink-0">{s.detail}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="border border-red-800 bg-red-950/40 rounded-lg p-4 text-sm text-red-300">
          {errorMsg}
        </div>
      )}

      {result && (
        <div className={`border rounded-lg p-5 ${verdictColor(result.verdict)}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider opacity-60 mb-1">Verdict</p>
              <p className="text-2xl font-bold">{result.verdict}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wider opacity-60 mb-1">Fraud Score</p>
              <p className="text-3xl font-bold">{result.score}</p>
            </div>
          </div>

          {result.duplicate && (
            <p className="text-xs opacity-60 mb-3">This email was previously analyzed — showing cached result.</p>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => router.push(`/result/${result.emailId}`)}
              className="text-sm px-4 py-2 rounded-lg border border-current bg-current/10 hover:bg-current/20 transition-colors font-medium"
            >
              View Full Report
            </button>
            <a
              href={`/api/report/${result.emailId}`}
              className="text-sm px-4 py-2 rounded-lg border border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-colors"
            >
              Download PDF
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
