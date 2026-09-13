import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

type Verdict = "Legitimate" | "Suspicious" | "Fraudulent";

async function getEmail(id: string) {
  return prisma.email.findUnique({
    where: { id },
    include: {
      ips: { orderBy: { isOriginating: "desc" } },
      domains: true,
      urls: { take: 50 },
      campaigns: {
        include: {
          campaign: {
            include: { emails: { select: { emailId: true } } },
          },
        },
      },
    },
  });
}

function VerdictBadge({ verdict, score }: { verdict: string; score: number }) {
  const colors: Record<Verdict, string> = {
    Fraudulent: "bg-red-500/20 text-red-300 border-red-500/40",
    Suspicious: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
    Legitimate: "bg-green-500/20 text-green-300 border-green-500/40",
  };
  const cls = colors[verdict as Verdict] ?? colors.Suspicious;
  return (
    <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg border ${cls}`}>
      <span className="text-lg font-bold">{verdict}</span>
      <span className="text-3xl font-black">{score}</span>
      <span className="text-sm opacity-60">/ 100</span>
    </div>
  );
}

function AuthBadge({ label, status }: { label: string; status: string }) {
  const cls =
    status === "pass"
      ? "text-green-400 bg-green-500/10 border-green-500/30"
      : status === "fail"
      ? "text-red-400 bg-red-500/10 border-red-500/30"
      : "text-gray-500 bg-gray-800 border-gray-700";
  return (
    <span className={`text-xs font-mono px-2 py-1 rounded border ${cls}`}>
      {label}: {status}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-800 rounded-lg bg-gray-900 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-800">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

export default async function ResultPage({
  params,
}: {
  params: { id: string };
}) {
  const email = await getEmail(params.id);
  if (!email) notFound();

  const campaign = email.campaigns[0]?.campaign;
  const domain = email.domains[0];
  const originatingIp = email.ips.find((ip) => ip.isOriginating) ?? email.ips[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-gray-500 text-sm mb-1">
            {new Date(email.analyzedAt).toLocaleString()}
          </p>
          <h1 className="text-xl font-bold text-white mb-1 line-clamp-2">
            {email.subject || "(no subject)"}
          </h1>
          <p className="text-gray-400 text-sm font-mono">{email.sender}</p>
        </div>
        <VerdictBadge verdict={email.verdict} score={email.fraudScore} />
      </div>

      <div className="flex gap-3 flex-wrap">
        <a
          href={`/api/report/${email.id}`}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition-colors font-medium"
        >
          Download PDF Report
        </a>
        <a
          href="/"
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors border border-gray-700"
        >
          Analyze Another
        </a>
      </div>

      {/* Authentication */}
      <Section title="Email Authentication">
        <div className="flex flex-wrap gap-2 mb-3">
          <AuthBadge label="SPF" status={email.spf} />
          <AuthBadge label="DKIM" status={email.dkim} />
          <AuthBadge label="DMARC" status={email.dmarc} />
        </div>
        {email.hfScore !== null && (
          <p className="text-gray-400 text-xs mb-1">
            AI phishing confidence:{" "}
            <span className={email.hfScore > 0.7 ? "text-red-400 font-semibold" : "text-green-400"}>
              {(email.hfScore * 100).toFixed(0)}%
            </span>
          </p>
        )}
        <p className="text-gray-600 text-xs">
          Parsed from <code className="text-gray-500">Authentication-Results</code> header.
          Fails: SPF (+20), DKIM (+20), DMARC (+15) → current score{" "}
          <span className="text-gray-400">{email.fraudScore}</span>
        </p>
      </Section>

      {/* Relay Hops */}
      <Section title={`Geolocation Trace — ${email.ips.length} relay hops`}>
        {email.ips.length === 0 ? (
          <p className="text-gray-600 text-sm">No public IP addresses found in relay chain.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-xs uppercase tracking-wider border-b border-gray-800">
                  <th className="pb-2 pr-4">IP</th>
                  <th className="pb-2 pr-4">Country</th>
                  <th className="pb-2 pr-4">ASN</th>
                  <th className="pb-2 pr-4">Organization</th>
                  <th className="pb-2">Abuse Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {email.ips.map((ip) => (
                  <tr key={ip.id} className={ip.isOriginating ? "bg-red-500/5" : ""}>
                    <td className="py-2 pr-4 font-mono text-gray-300">
                      {ip.ip}
                      {ip.isOriginating && (
                        <span className="ml-2 text-xs text-red-400 font-sans">origin</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-gray-400">{ip.country ?? "—"}</td>
                    <td className="py-2 pr-4 font-mono text-gray-400 text-xs">{ip.asn ?? "—"}</td>
                    <td className="py-2 pr-4 text-gray-400 text-xs">{ip.org ?? "—"}</td>
                    <td className="py-2">
                      {ip.abuseScore !== null ? (
                        <span
                          className={
                            ip.abuseScore > 50
                              ? "text-red-400"
                              : ip.abuseScore > 10
                              ? "text-yellow-400"
                              : "text-green-400"
                          }
                        >
                          {ip.abuseScore}%
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Domain Intelligence */}
      <Section title="Domain Intelligence">
        {domain ? (
          <div className="space-y-2 text-sm">
            <div className="flex gap-4 flex-wrap">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Sender Domain</p>
                <p className="font-mono text-gray-200">{domain.domain}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Domain Age</p>
                <p className={domain.whoisAgeDays !== null && domain.whoisAgeDays < 30
                  ? "text-red-400 font-semibold"
                  : "text-gray-200"
                }>
                  {domain.whoisAgeDays !== null
                    ? `${domain.whoisAgeDays} days`
                    : "unknown"}
                  {domain.whoisAgeDays !== null && domain.whoisAgeDays < 30 && (
                    <span className="ml-2 text-xs font-normal">⚠ newly registered</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Registrar</p>
                <p className="text-gray-200">{domain.registrar ?? "unknown"}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">No WHOIS data available.</p>
        )}
      </Section>

      {/* Campaign Attribution */}
      <Section title="Campaign Attribution">
        {campaign ? (
          <div className="text-sm space-y-2">
            <p className="text-gray-200">
              Campaign{" "}
              <span className="font-mono text-red-400">#{campaign.id.slice(-6)}</span>
              {" — "}
              <span className="font-semibold">{campaign.emails.length} email{campaign.emails.length !== 1 ? "s" : ""}</span>
              {originatingIp?.org && (
                <span className="text-gray-400">, originating from {originatingIp.org}</span>
              )}
            </p>
            <a
              href="/campaigns"
              className="text-red-400 hover:text-red-300 text-xs transition-colors"
            >
              View all campaigns →
            </a>
          </div>
        ) : (
          <p className="text-gray-600 text-sm">
            No campaign match — this email does not share IPs or domains with other analyzed emails.
          </p>
        )}
      </Section>

      {/* Indicators of Compromise */}
      <Section title={`Indicators of Compromise`}>
        <div className="space-y-4 text-sm">
          {email.ips.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">IP Addresses</p>
              <div className="flex flex-wrap gap-2">
                {email.ips.map((ip) => (
                  <span key={ip.id} className="font-mono text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">
                    {ip.ip}
                  </span>
                ))}
              </div>
            </div>
          )}

          {email.domains.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Domains</p>
              <div className="flex flex-wrap gap-2">
                {email.domains.map((d) => (
                  <span key={d.id} className="font-mono text-xs bg-gray-800 px-2 py-1 rounded text-gray-300">
                    {d.domain}
                  </span>
                ))}
              </div>
            </div>
          )}

          {email.urls.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">
                URLs ({email.urls.length})
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {email.urls.map((u) => (
                  <p key={u.id} className="font-mono text-xs text-gray-400 break-all">
                    {u.url}
                  </p>
                ))}
              </div>
            </div>
          )}

          {email.ips.length === 0 && email.domains.length === 0 && email.urls.length === 0 && (
            <p className="text-gray-600">No indicators of compromise extracted.</p>
          )}
        </div>
      </Section>
    </div>
  );
}
