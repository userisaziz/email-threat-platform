"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, Loader2, Shield, ShieldAlert, ShieldCheck, FileText, RotateCcw } from "lucide-react";

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

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "running") return <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin" />;
  if (status === "done") return <span className="w-3.5 h-3.5 text-green-400 text-sm leading-none">✓</span>;
  if (status === "unavailable") return <span className="w-3.5 h-3.5 text-yellow-500 text-sm leading-none">~</span>;
  if (status === "error") return <span className="w-3.5 h-3.5 text-red-400 text-sm leading-none">✗</span>;
  return <span className="w-3.5 h-3.5 text-gray-700 text-sm leading-none">○</span>;
}

function VerdictIcon({ verdict }: { verdict: string }) {
  if (verdict === "Fraudulent") return <ShieldAlert className="w-6 h-6 text-red-400" />;
  if (verdict === "Suspicious") return <Shield className="w-6 h-6 text-yellow-400" />;
  return <ShieldCheck className="w-6 h-6 text-green-400" />;
}

function completedSteps(steps: Step[]) {
  return steps.filter((s) => s.status === "done" || s.status === "unavailable").length;
}

export default function AnalyzeForm() {
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
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function markRunning(id: string) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status: "running" } : s)));
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
            handleEvent(JSON.parse(line));
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
    if (step === "error") { setErrorMsg(event.message as string); return; }
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
    const status = event.status === "unavailable" ? "unavailable" : "done";
    if (step === "headers") {
      updateStep("headers", { status, detail: `${event.hopCount} hops · SPF:${event.spf} DKIM:${event.dkim} DMARC:${event.dmarc}` });
      markRunning("geolocation");
    } else if (step === "geolocation") {
      updateStep("geolocation", { status, detail: `${event.hops} IPs geolocated` });
      markRunning("classification"); markRunning("whois");
    } else if (step === "classification") {
      updateStep("classification", { status, detail: event.score != null ? `${((event.score as number) * 100).toFixed(0)}% phishing confidence` : "unavailable" });
    } else if (step === "whois") {
      updateStep("whois", { status, detail: event.ageDays != null ? `domain age: ${event.ageDays}d` : "age unknown" });
      markRunning("reputation");
    } else if (step === "reputation") {
      updateStep("reputation", { status, detail: event.abuseScore != null ? `AbuseIPDB: ${event.abuseScore}%` : "n/a" });
      markRunning("complete");
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setEml(await file.text());
  }

  const progress = running ? Math.round((completedSteps(steps) / steps.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Email Threat Analysis</h1>
        <p className="text-gray-400 text-sm">
          Paste raw .eml content or upload a file to detect phishing, trace relay hops, and correlate attack campaigns.
        </p>
      </div>

      <Card>
        <CardContent className="pt-5 space-y-4">
          <textarea
            value={eml}
            onChange={(e) => setEml(e.target.value)}
            placeholder={"Paste raw .eml content here...\n\nReceived: from mail.example.com ([1.2.3.4])\nAuthentication-Results: mx.example.com;\n  spf=fail; dkim=fail; dmarc=fail\n\nSubject: Urgent: Verify your account"}
            className="w-full h-48 bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-sm font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500/60 resize-none"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={handleAnalyze} disabled={running || !eml.trim()}>
              {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : "Analyze Email"}
            </Button>
            <Button variant="secondary" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" /> Upload .eml
            </Button>
            <input ref={fileRef} type="file" accept=".eml,message/rfc822" className="hidden" onChange={handleFileUpload} />
            {eml && (
              <Button variant="ghost" size="sm" className="ml-auto" onClick={() => { setEml(""); resetState(); }}>
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {(running || result || errorMsg) && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {running && <Progress value={progress} className="h-1.5" />}
            <div className="space-y-2.5">
              {steps.map((s) => (
                <div key={s.id} className="flex items-center gap-3 text-sm">
                  <StepIcon status={s.status} />
                  <span className={s.status === "pending" ? "text-gray-600" : "text-gray-300"}>
                    {s.label}
                  </span>
                  {s.detail && (
                    <span className="text-gray-500 text-xs ml-auto font-mono">{s.detail}</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {errorMsg && (
        <Card className="border-red-800 bg-red-950/30">
          <CardContent className="pt-4 text-sm text-red-300">{errorMsg}</CardContent>
        </Card>
      )}

      {result && (
        <Card className={
          result.verdict === "Fraudulent"
            ? "border-red-500/40 bg-red-950/20"
            : result.verdict === "Suspicious"
            ? "border-yellow-500/40 bg-yellow-950/20"
            : "border-green-500/40 bg-green-950/20"
        }>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <VerdictIcon verdict={result.verdict} />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Verdict</p>
                  <p className="text-xl font-bold text-white">{result.verdict}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Fraud Score</p>
                <p className="text-4xl font-black text-white">{result.score}<span className="text-sm text-gray-500 font-normal">/100</span></p>
              </div>
            </div>

            {result.duplicate && (
              <p className="text-xs text-gray-500 mb-4">Previously analyzed — showing cached result.</p>
            )}

            <div className="flex gap-3 flex-wrap">
              <Button onClick={() => router.push(`/result/${result.emailId}`)}>
                View Full Report
              </Button>
              <Button variant="secondary" asChild>
                <a href={`/api/report/${result.emailId}`}>
                  <FileText className="w-4 h-4" /> Download PDF
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
