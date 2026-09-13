import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import AnalyzeForm from "./analyze-form";

type Verdict = "Legitimate" | "Suspicious" | "Fraudulent";

async function getRecentEmails() {
  return prisma.email.findMany({
    orderBy: { analyzedAt: "desc" },
    take: 10,
    select: {
      id: true,
      sender: true,
      subject: true,
      verdict: true,
      fraudScore: true,
      analyzedAt: true,
    },
  });
}

function VerdictDot({ verdict }: { verdict: string }) {
  const colors: Record<Verdict, string> = {
    Fraudulent: "bg-red-500",
    Suspicious: "bg-yellow-500",
    Legitimate: "bg-green-500",
  };
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 mt-1.5 ${colors[verdict as Verdict] ?? "bg-gray-500"}`}
    />
  );
}

async function RecentAnalyses() {
  const emails = await getRecentEmails();
  if (emails.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Recent Analyses
      </h2>
      <div className="border border-gray-800 rounded-lg bg-gray-900 divide-y divide-gray-800/60">
        {emails.map((email) => (
          <a
            key={email.id}
            href={`/result/${email.id}`}
            className="flex items-start gap-3 px-5 py-3 hover:bg-gray-800/40 transition-colors"
          >
            <VerdictDot verdict={email.verdict} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200 truncate">
                {email.subject || "(no subject)"}
              </p>
              <p className="text-xs text-gray-500 font-mono truncate">{email.sender}</p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p
                className={`text-sm font-semibold ${
                  email.verdict === "Fraudulent"
                    ? "text-red-400"
                    : email.verdict === "Suspicious"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {email.fraudScore}
              </p>
              <p className="text-xs text-gray-600">
                {new Date(email.analyzedAt).toLocaleDateString()}
              </p>
            </div>
          </a>
        ))}
      </div>
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
