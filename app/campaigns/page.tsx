import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Verdict = "Legitimate" | "Suspicious" | "Fraudulent";

async function getCampaigns() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      emails: {
        include: {
          email: {
            include: {
              ips: {
                where: { isOriginating: true },
                select: { ip: true, country: true, asn: true, org: true },
                take: 1,
              },
            },
          },
        },
      },
    },
  });
  return campaigns;
}

function VerdictDot({ verdict }: { verdict: string }) {
  const colors: Record<Verdict, string> = {
    Fraudulent: "bg-red-500",
    Suspicious: "bg-yellow-500",
    Legitimate: "bg-green-500",
  };
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${colors[verdict as Verdict] ?? "bg-gray-500"}`}
    />
  );
}

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  const singletons = campaigns.filter((c) => c.emails.length === 1);
  const clustered = campaigns.filter((c) => c.emails.length > 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Campaign Intelligence</h1>
        <p className="text-gray-400 text-sm">
          Emails grouped by shared originating IPs and sender domains. Clusters indicate coordinated attacks.
        </p>
      </div>

      {campaigns.length === 0 && (
        <div className="border border-gray-800 rounded-lg bg-gray-900 p-8 text-center">
          <p className="text-gray-500 text-sm">No emails analyzed yet.</p>
          <a href="/" className="text-red-400 hover:text-red-300 text-sm mt-2 inline-block">
            Analyze an email →
          </a>
        </div>
      )}

      {clustered.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Correlated Campaigns ({clustered.length})
          </h2>
          {clustered.map((campaign) => {
            const emails = campaign.emails.map((ec) => ec.email);
            const topIp = emails[0]?.ips?.[0];
            const fraudulent = emails.filter((e) => e.verdict === "Fraudulent").length;
            const suspicious = emails.filter((e) => e.verdict === "Suspicious").length;

            return (
              <div
                key={campaign.id}
                className="border border-red-900/40 bg-red-950/10 rounded-lg overflow-hidden"
              >
                <div className="px-5 py-3 border-b border-red-900/30 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <span className="text-xs text-red-400 font-mono">
                      Campaign #{campaign.id.slice(-6)}
                    </span>
                    <p className="text-white font-semibold mt-0.5">
                      {emails.length} emails
                      {topIp?.org && (
                        <span className="text-gray-400 font-normal">
                          {" "}— {topIp.asn} ({topIp.org})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm shrink-0">
                    {fraudulent > 0 && (
                      <span className="text-red-400">{fraudulent} fraudulent</span>
                    )}
                    {suspicious > 0 && (
                      <span className="text-yellow-400">{suspicious} suspicious</span>
                    )}
                    {topIp?.country && (
                      <span className="text-gray-500">
                        Originating: {topIp.country}
                      </span>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-gray-800/40">
                  {emails.map((email) => (
                    <a
                      key={email.id}
                      href={`/result/${email.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/40 transition-colors"
                    >
                      <VerdictDot verdict={email.verdict} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 truncate">
                          {email.subject || "(no subject)"}
                        </p>
                        <p className="text-xs text-gray-500 font-mono truncate">{email.sender}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-300">{email.fraudScore}</p>
                        <p className="text-xs text-gray-600">
                          {new Date(email.analyzedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {singletons.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Standalone Emails ({singletons.length})
          </h2>
          <div className="border border-gray-800 rounded-lg bg-gray-900 divide-y divide-gray-800/60">
            {singletons.map((campaign) => {
              const email = campaign.emails[0]?.email;
              if (!email) return null;
              return (
                <a
                  key={email.id}
                  href={`/result/${email.id}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/40 transition-colors"
                >
                  <VerdictDot verdict={email.verdict} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">
                      {email.subject || "(no subject)"}
                    </p>
                    <p className="text-xs text-gray-500 font-mono truncate">{email.sender}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-300">{email.fraudScore}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(email.analyzedAt).toLocaleDateString()}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
