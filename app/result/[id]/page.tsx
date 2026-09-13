import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShieldAlert, Shield, ShieldCheck, FileText, ArrowLeft, Globe, Cpu, Link2 } from "lucide-react";

export const dynamic = "force-dynamic";

type Verdict = "Legitimate" | "Suspicious" | "Fraudulent";

async function getEmail(id: string) {
  return prisma.email.findUnique({
    where: { id },
    include: {
      ips: { orderBy: { isOriginating: "desc" } },
      domains: true,
      urls: { take: 50 },
      campaigns: { include: { campaign: { include: { emails: { select: { emailId: true } } } } } },
    },
  });
}

function VerdictCard({ verdict, score }: { verdict: string; score: number }) {
  const config = {
    Fraudulent: { icon: ShieldAlert, cls: "border-red-500/40 bg-red-950/20", iconCls: "text-red-400", label: "text-red-300" },
    Suspicious: { icon: Shield, cls: "border-yellow-500/40 bg-yellow-950/20", iconCls: "text-yellow-400", label: "text-yellow-300" },
    Legitimate: { icon: ShieldCheck, cls: "border-green-500/40 bg-green-950/20", iconCls: "text-green-400", label: "text-green-300" },
  }[verdict as Verdict] ?? { icon: Shield, cls: "border-gray-700 bg-gray-900", iconCls: "text-gray-400", label: "text-gray-300" };

  const Icon = config.icon;
  return (
    <Card className={config.cls}>
      <CardContent className="pt-4 pb-4 flex items-center gap-4">
        <Icon className={`w-10 h-10 ${config.iconCls}`} />
        <div>
          <p className={`text-xl font-bold ${config.label}`}>{verdict}</p>
          <p className="text-xs text-gray-500">Fraud score</p>
        </div>
        <div className="ml-auto text-right">
          <span className="text-4xl font-black text-white">{score}</span>
          <span className="text-gray-500 text-sm">/100</span>
        </div>
      </CardContent>
    </Card>
  );
}

function AuthBadge({ label, status }: { label: string; status: string }) {
  const variant = status === "pass" ? "success" : status === "fail" ? "destructive" : "default";
  return <Badge variant={variant as "success" | "destructive" | "default"}>{label}: {status}</Badge>;
}

export default async function ResultPage({ params }: { params: { id: string } }) {
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
          <p className="text-gray-500 text-xs mb-1">{new Date(email.analyzedAt).toLocaleString()}</p>
          <h1 className="text-xl font-bold text-white mb-1 line-clamp-2">{email.subject || "(no subject)"}</h1>
          <p className="text-gray-400 text-sm font-mono">{email.sender}</p>
        </div>
      </div>

      <VerdictCard verdict={email.verdict} score={email.fraudScore} />

      <div className="flex gap-3 flex-wrap">
        <Button asChild>
          <a href={`/api/report/${email.id}`}>
            <FileText className="w-4 h-4" /> Download PDF Report
          </a>
        </Button>
        <Button variant="secondary" asChild>
          <a href="/"><ArrowLeft className="w-4 h-4" /> Analyze Another</a>
        </Button>
      </div>

      <Separator />

      {/* Authentication */}
      <Card>
        <CardHeader><CardTitle>Email Authentication</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <AuthBadge label="SPF" status={email.spf} />
            <AuthBadge label="DKIM" status={email.dkim} />
            <AuthBadge label="DMARC" status={email.dmarc} />
          </div>
          {email.hfScore !== null && (
            <p className="text-gray-400 text-xs">
              AI phishing confidence:{" "}
              <span className={email.hfScore > 0.7 ? "text-red-400 font-semibold" : "text-green-400"}>
                {(email.hfScore * 100).toFixed(0)}%
              </span>
            </p>
          )}
          <p className="text-gray-600 text-xs">
            Parsed from <code className="text-gray-500">Authentication-Results</code> header.
            Fails: SPF (+20), DKIM (+20), DMARC (+15). Score: <span className="text-gray-400">{email.fraudScore}</span>
          </p>
        </CardContent>
      </Card>

      {/* Relay Hops */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Geolocation Trace — {email.ips.length} relay hops
          </CardTitle>
        </CardHeader>
        <CardContent>
          {email.ips.length === 0 ? (
            <p className="text-gray-600 text-sm">No public IP addresses found.</p>
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
                        {ip.isOriginating && <Badge variant="destructive" className="ml-2 text-[10px] py-0">origin</Badge>}
                      </td>
                      <td className="py-2 pr-4 text-gray-400">{ip.country ?? "—"}</td>
                      <td className="py-2 pr-4 font-mono text-gray-400 text-xs">{ip.asn ?? "—"}</td>
                      <td className="py-2 pr-4 text-gray-400 text-xs">{ip.org ?? "—"}</td>
                      <td className="py-2">
                        {ip.abuseScore !== null ? (
                          <Badge variant={ip.abuseScore > 50 ? "destructive" : ip.abuseScore > 10 ? "warning" : "success"}>
                            {ip.abuseScore}%
                          </Badge>
                        ) : <span className="text-gray-600">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Domain Intelligence */}
      <Card>
        <CardHeader><CardTitle>Domain Intelligence</CardTitle></CardHeader>
        <CardContent>
          {domain ? (
            <div className="flex gap-6 flex-wrap text-sm">
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Sender Domain</p>
                <p className="font-mono text-gray-200">{domain.domain}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Domain Age</p>
                <div className="flex items-center gap-2">
                  <p className={domain.whoisAgeDays !== null && domain.whoisAgeDays < 30 ? "text-red-400 font-semibold" : "text-gray-200"}>
                    {domain.whoisAgeDays !== null ? `${domain.whoisAgeDays} days` : "unknown"}
                  </p>
                  {domain.whoisAgeDays !== null && domain.whoisAgeDays < 30 && (
                    <Badge variant="destructive">newly registered</Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Registrar</p>
                <p className="text-gray-200">{domain.registrar ?? "unknown"}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No WHOIS data available.</p>
          )}
        </CardContent>
      </Card>

      {/* Campaign */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="w-4 h-4" /> Campaign Attribution</CardTitle></CardHeader>
        <CardContent>
          {campaign ? (
            <div className="text-sm space-y-2">
              <p className="text-gray-200">
                Campaign <span className="font-mono text-red-400">#{campaign.id.slice(-6)}</span>
                {" — "}
                <span className="font-semibold">{campaign.emails.length} email{campaign.emails.length !== 1 ? "s" : ""}</span>
                {originatingIp?.org && <span className="text-gray-400">, from {originatingIp.org}</span>}
              </p>
              <Button variant="link" size="sm" className="px-0 h-auto" asChild>
                <a href="/campaigns">View all campaigns →</a>
              </Button>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No campaign match — does not share IPs or domains with other analyzed emails.</p>
          )}
        </CardContent>
      </Card>

      {/* IOCs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Link2 className="w-4 h-4" /> Indicators of Compromise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {email.ips.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">IP Addresses</p>
              <div className="flex flex-wrap gap-2">
                {email.ips.map((ip) => (
                  <Badge key={ip.id} variant="outline" className="font-mono">{ip.ip}</Badge>
                ))}
              </div>
            </div>
          )}
          {email.domains.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Domains</p>
              <div className="flex flex-wrap gap-2">
                {email.domains.map((d) => (
                  <Badge key={d.id} variant="outline" className="font-mono">{d.domain}</Badge>
                ))}
              </div>
            </div>
          )}
          {email.urls.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">URLs ({email.urls.length})</p>
              <div className="space-y-1 max-h-40 overflow-y-auto rounded-lg bg-gray-950 p-3 border border-gray-800">
                {email.urls.map((u) => (
                  <p key={u.id} className="font-mono text-xs text-gray-400 break-all">{u.url}</p>
                ))}
              </div>
            </div>
          )}
          {email.ips.length === 0 && email.domains.length === 0 && email.urls.length === 0 && (
            <p className="text-gray-600">No indicators of compromise extracted.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
