import { prisma } from "./prisma";

export interface AbuseResult {
  score: number | null;
  available: boolean;
}

export async function checkAbuseIpdb(ip: string): Promise<AbuseResult> {
  const key = process.env.ABUSEIPDB_KEY;
  if (!key) return { score: null, available: false };

  // Check DB cache first (7-day TTL)
  const cached = await prisma.emailIp.findFirst({
    where: {
      ip,
      abuseScore: { not: null },
      abuseCheckedAt: { gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    select: { abuseScore: true },
    orderBy: { abuseCheckedAt: "desc" },
  });

  if (cached?.abuseScore !== undefined && cached.abuseScore !== null) {
    return { score: cached.abuseScore, available: true };
  }

  try {
    const res = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90`,
      {
        headers: {
          Key: key,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) return { score: null, available: false };
    const data = await res.json();
    const score: number = data?.data?.abuseConfidenceScore ?? 0;
    return { score, available: true };
  } catch {
    return { score: null, available: false };
  }
}
