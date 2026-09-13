import { Prisma } from "@prisma/client";

export async function assignCampaign(
  emailId: string,
  ips: string[],
  senderDomain: string,
  tx: Prisma.TransactionClient
): Promise<string> {
  // Find existing emails sharing an IP or sender domain
  const overlapping = await tx.emailIp.findMany({
    where: { ip: { in: ips }, emailId: { not: emailId } },
    select: { emailId: true },
  });
  const domainOverlap = await tx.emailDomain.findMany({
    where: { domain: senderDomain, emailId: { not: emailId } },
    select: { emailId: true },
  });

  const overlappingIds = Array.from(
    new Set([
      ...overlapping.map((r) => r.emailId),
      ...domainOverlap.map((r) => r.emailId),
    ])
  );

  // Find campaign IDs for all overlapping emails
  const existingMemberships = await tx.emailCampaign.findMany({
    where: { emailId: { in: overlappingIds } },
    select: { campaignId: true },
  });

  const campaignIds = Array.from(
    new Set(existingMemberships.map((m) => m.campaignId))
  ).sort();

  if (campaignIds.length === 0) {
    // No overlap — create a new campaign
    const campaign = await tx.campaign.create({ data: {} });
    await tx.emailCampaign.create({
      data: { emailId, campaignId: campaign.id },
    });
    return campaign.id;
  }

  // Merge all campaigns into the lowest ID (union-find: smallest wins)
  const survivingId = campaignIds[0];

  if (campaignIds.length > 1) {
    const mergingIds = campaignIds.slice(1);
    // Reparent all email_campaign rows from merging IDs to surviving ID
    for (const oldId of mergingIds) {
      const members = await tx.emailCampaign.findMany({
        where: { campaignId: oldId },
        select: { emailId: true },
      });
      for (const m of members) {
        const exists = await tx.emailCampaign.findUnique({
          where: { emailId_campaignId: { emailId: m.emailId, campaignId: survivingId } },
        });
        if (!exists) {
          await tx.emailCampaign.create({
            data: { emailId: m.emailId, campaignId: survivingId },
          });
        }
        await tx.emailCampaign.delete({
          where: { emailId_campaignId: { emailId: m.emailId, campaignId: oldId } },
        });
      }
      await tx.campaign.delete({ where: { id: oldId } });
    }
  }

  // Add this new email to the surviving campaign
  await tx.emailCampaign.upsert({
    where: { emailId_campaignId: { emailId, campaignId: survivingId } },
    create: { emailId, campaignId: survivingId },
    update: {},
  });

  return survivingId;
}
