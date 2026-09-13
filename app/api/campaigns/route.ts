import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      emails: {
        include: {
          email: {
            select: {
              id: true,
              sender: true,
              verdict: true,
              fraudScore: true,
              analyzedAt: true,
            },
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

  const result = campaigns.map((c) => {
    const emails = c.emails.map((ec) => ec.email);
    const topIp = emails[0]?.ips?.[0];
    return {
      id: c.id,
      createdAt: c.createdAt,
      emailCount: emails.length,
      topAsn: topIp?.asn ?? null,
      topOrg: topIp?.org ?? null,
      topCountry: topIp?.country ?? null,
      emails: emails.map((e) => ({
        id: e.id,
        sender: e.sender,
        verdict: e.verdict,
        fraudScore: e.fraudScore,
        analyzedAt: e.analyzedAt,
      })),
    };
  });

  return NextResponse.json(result);
}
