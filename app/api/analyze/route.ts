import { NextRequest } from "next/server";
import { parseEml } from "@/lib/parse-email";
import { geolocateIps } from "@/lib/geo";
import { classifyPhishing } from "@/lib/classify";
import { lookupWhois } from "@/lib/whois";
import { checkAbuseIpdb } from "@/lib/abuse";
import { computeFraudScore } from "@/lib/fraud-score";
import { assignCampaign } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";

const MAX_EML_BYTES = 500 * 1024; // 500KB

function sse(event: Record<string, unknown>): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(sse(event)));
      };

      try {
        const body = await req.text();

        // Input validation
        if (new Blob([body]).size > MAX_EML_BYTES) {
          send({ step: "error", message: "Email exceeds 500KB limit." });
          controller.close();
          return;
        }

        // Step 1: Parse headers
        let parsed;
        try {
          parsed = await parseEml(body);
        } catch (e) {
          send({
            step: "error",
            message: e instanceof Error ? e.message : "Invalid .eml format.",
          });
          controller.close();
          return;
        }

        // Reject duplicate (same hash already analyzed)
        const existing = await prisma.email.findUnique({
          where: { hash: parsed.hash },
          select: { id: true, fraudScore: true, verdict: true },
        });
        if (existing) {
          send({
            step: "complete",
            emailId: existing.id,
            verdict: existing.verdict,
            score: existing.fraudScore,
            duplicate: true,
          });
          controller.close();
          return;
        }

        send({
          step: "headers",
          status: "done",
          hopCount: parsed.hops.length,
          spf: parsed.auth.spf,
          dkim: parsed.auth.dkim,
          dmarc: parsed.auth.dmarc,
        });

        // Step 2: Geolocation (parallel)
        const publicIps = parsed.hops
          .filter((h) => !h.isPrivate)
          .map((h) => h.ip);

        const geoResults = publicIps.length > 0
          ? await geolocateIps(publicIps)
          : [];

        send({ step: "geolocation", status: "done", hops: geoResults.length });

        // Step 3: HuggingFace classification + URL extraction (parallel with WHOIS)
        const [classifyResult, whoisResult] = await Promise.all([
          classifyPhishing(parsed.subject, parsed.body),
          lookupWhois(parsed.senderDomain),
        ]);

        send({
          step: "classification",
          status: classifyResult.available ? "done" : "unavailable",
          score: classifyResult.phishingScore,
        });

        send({
          step: "whois",
          status: "done",
          ageDays: whoisResult.ageDays,
        });

        // Step 4: AbuseIPDB on originating IP (first non-private hop)
        const originatingIp = publicIps[publicIps.length - 1] ?? null;
        const abuseResult = originatingIp
          ? await checkAbuseIpdb(originatingIp)
          : { score: null, available: false };

        send({
          step: "reputation",
          status: abuseResult.available ? "done" : "unavailable",
          abuseScore: abuseResult.score,
        });

        // Step 5: Compute fraud score
        const { score, verdict } = computeFraudScore({
          spfFail: parsed.auth.spf === "fail",
          dkimFail: parsed.auth.dkim === "fail",
          dmarcFail: parsed.auth.dmarc === "fail",
          domainAgeDays: whoisResult.ageDays,
          hfPhishingScore: classifyResult.phishingScore,
          abuseIpdbScore: abuseResult.score,
        });

        // Step 6: Write to DB in a single transaction
        const emailId = await prisma.$transaction(async (tx) => {
          const email = await tx.email.create({
            data: {
              hash: parsed.hash,
              subject: parsed.subject,
              sender: parsed.sender,
              fraudScore: score,
              verdict,
              spf: parsed.auth.spf,
              dkim: parsed.auth.dkim,
              dmarc: parsed.auth.dmarc,
              hfScore: classifyResult.phishingScore,
              rawEml: body,
            },
          });

          // Insert IPs
          if (geoResults.length > 0) {
            const originatingIpValue = publicIps[publicIps.length - 1];
            await tx.emailIp.createMany({
              data: geoResults.map((g) => ({
                emailId: email.id,
                ip: g.ip,
                country: g.country,
                asn: g.asn,
                org: g.org,
                abuseScore: g.ip === originatingIpValue ? abuseResult.score : null,
                abuseCheckedAt:
                  g.ip === originatingIpValue && abuseResult.available
                    ? new Date()
                    : null,
                isOriginating: g.ip === originatingIpValue,
              })),
            });
          }

          // Insert domain
          await tx.emailDomain.create({
            data: {
              emailId: email.id,
              domain: parsed.senderDomain,
              whoisAgeDays: whoisResult.ageDays,
              registrar: whoisResult.registrar,
              whoisCheckedAt: new Date(),
            },
          });

          // Insert URLs
          if (parsed.urls.length > 0) {
            await tx.emailUrl.createMany({
              data: parsed.urls.map((url) => ({ emailId: email.id, url })),
            });
          }

          // Campaign clustering
          await assignCampaign(email.id, publicIps, parsed.senderDomain, tx);

          return email.id;
        });

        send({ step: "complete", emailId, verdict, score });
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            sse({
              step: "error",
              message:
                err instanceof Error ? err.message : "Unexpected error",
            })
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
