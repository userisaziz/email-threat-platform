import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShieldAlert, Shield, ShieldCheck, Network, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

async function getCampaigns() {
  return prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      emails: {
        include: {
          email: {
            include: {
              ips: { where: { isOriginating: true }, select: { ip: true, country: true, asn: true, org: true }, take: 1 },
            },
          },
        },
      },
    },
  });
}

function verdictVariant(verdict: string) {
  if (verdict === "Fraudulent") return "destructive" as const;
  if (verdict === "Suspicious") return "warning" as const;
  return "success" as const;
}

function VerdictIcon({ verdict }: { verdict: string }) {
  const cls = "w-3.5 h-3.5 shrink-0";
  if (verdict === "Fraudulent") return <ShieldAlert className={`${cls} text-red-400`} />;
  if (verdict === "Suspicious") return <Shield className={`${cls} text-yellow-400`} />;
  return <ShieldCheck className={`${cls} text-green-400`} />;
}

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();
  const singletons = campaigns.filter((c) => c.emails.length === 1);
  const clustered = campaigns.filter((c) => c.emails.length > 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Campaign Intelligence</h1>
        <p className="text-gray-400 text-sm">
          Emails grouped by shared originating IPs and sender domains. Clusters indicate coordinated attacks.
        </p>
      </div>

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <Mail className="w-10 h-10 text-gray-700 mx-auto" />
            <p className="text-gray-500 text-sm">No emails analyzed yet.</p>
            <Button variant="link" asChild>
              <a href="/">Analyze your first email →</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {clustered.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Correlated Campaigns <span className="text-red-400">({clustered.length})</span>
            </h2>
          </div>

          {clustered.map((campaign) => {
            const emails = campaign.emails.map((ec) => ec.email);
            const topIp = emails[0]?.ips?.[0];
            const fraudulent = emails.filter((e) => e.verdict === "Fraudulent").length;
            const suspicious = emails.filter((e) => e.verdict === "Suspicious").length;

            return (
              <Card key={campaign.id} className="border-red-900/40 bg-red-950/10">
                <CardHeader className="border-b border-red-900/30">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-xs text-red-400 font-mono mb-0.5">Campaign #{campaign.id.slice(-6)}</p>
                      <CardTitle className="text-white text-sm font-semibold normal-case tracking-normal">
                        {emails.length} emails
                        {topIp?.org && <span className="text-gray-400 font-normal"> — {topIp.asn} ({topIp.org})</span>}
                      </CardTitle>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {fraudulent > 0 && <Badge variant="destructive">{fraudulent} fraudulent</Badge>}
                      {suspicious > 0 && <Badge variant="warning">{suspicious} suspicious</Badge>}
                      {topIp?.country && <Badge variant="outline">{topIp.country}</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-gray-800/40">
                  {emails.map((email) => (
                    <a
                      key={email.id}
                      href={`/result/${email.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/40 transition-colors"
                    >
                      <VerdictIcon verdict={email.verdict} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-200 truncate">{email.subject || "(no subject)"}</p>
                        <p className="text-xs text-gray-500 font-mono truncate">{email.sender}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={verdictVariant(email.verdict)}>{email.fraudScore}</Badge>
                        <span className="text-xs text-gray-600">{new Date(email.analyzedAt).toLocaleDateString()}</span>
                      </div>
                    </a>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {clustered.length > 0 && singletons.length > 0 && <Separator />}

      {singletons.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Standalone Emails ({singletons.length})
          </h2>
          <Card>
            <CardContent className="p-0 divide-y divide-gray-800/60">
              {singletons.map((campaign) => {
                const email = campaign.emails[0]?.email;
                if (!email) return null;
                return (
                  <a
                    key={email.id}
                    href={`/result/${email.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-800/40 transition-colors"
                  >
                    <VerdictIcon verdict={email.verdict} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{email.subject || "(no subject)"}</p>
                      <p className="text-xs text-gray-500 font-mono truncate">{email.sender}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={verdictVariant(email.verdict)}>{email.fraudScore}</Badge>
                      <span className="text-xs text-gray-600">{new Date(email.analyzedAt).toLocaleDateString()}</span>
                    </div>
                  </a>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
