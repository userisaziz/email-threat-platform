import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import AnalyzeForm from "./analyze-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Verdict = "Legitimate" | "Suspicious" | "Fraudulent";

async function getRecentEmails() {
  return prisma.email.findMany({
    orderBy: { analyzedAt: "desc" },
    take: 10,
    select: { id: true, sender: true, subject: true, verdict: true, fraudScore: true, analyzedAt: true },
  });
}

function verdictVariant(verdict: string) {
  if (verdict === "Fraudulent") return "destructive" as const;
  if (verdict === "Suspicious") return "warning" as const;
  return "success" as const;
}

function VerdictDot({ verdict }: { verdict: string }) {
  const colors: Record<Verdict, string> = {
    Fraudulent: "bg-red-500",
    Suspicious: "bg-yellow-500",
    Legitimate: "bg-green-500",
  };
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 mt-1.5 ${colors[verdict as Verdict] ?? "bg-gray-500"}`} />;
}

async function RecentAnalyses() {
  const emails = await getRecentEmails();
  if (emails.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Recent Analyses</h2>
      <Card>
        <CardContent className="p-0 divide-y divide-gray-800/60">
          {emails.map((email) => (
            <a
              key={email.id}
              href={`/result/${email.id}`}
              className="flex items-start gap-3 px-5 py-3 hover:bg-gray-800/40 transition-colors"
            >
              <VerdictDot verdict={email.verdict} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 truncate">{email.subject || "(no subject)"}</p>
                <p className="text-xs text-gray-500 font-mono truncate">{email.sender}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <Badge variant={verdictVariant(email.verdict)}>{email.fraudScore}</Badge>
                <span className="text-xs text-gray-600">{new Date(email.analyzedAt).toLocaleDateString()}</span>
              </div>
            </a>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <AnalyzeForm />
      <Suspense fallback={null}>
        <RecentAnalyses />
      </Suspense>
    </>
  );
}
