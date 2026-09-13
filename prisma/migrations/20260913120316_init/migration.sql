-- CreateTable
CREATE TABLE "emails" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "subject" TEXT,
    "sender" TEXT NOT NULL,
    "fraudScore" INTEGER NOT NULL,
    "verdict" TEXT NOT NULL,
    "spf" TEXT NOT NULL DEFAULT 'none',
    "dkim" TEXT NOT NULL DEFAULT 'none',
    "dmarc" TEXT NOT NULL DEFAULT 'none',
    "hfScore" DOUBLE PRECISION,
    "analyzedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawEml" TEXT NOT NULL,

    CONSTRAINT "emails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_ips" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "country" TEXT,
    "asn" TEXT,
    "org" TEXT,
    "abuseScore" INTEGER,
    "abuseCheckedAt" TIMESTAMP(3),
    "isOriginating" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "email_ips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_domains" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "whoisAgeDays" INTEGER,
    "registrar" TEXT,
    "whoisCheckedAt" TIMESTAMP(3),

    CONSTRAINT "email_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_urls" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "email_urls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_campaigns" (
    "emailId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,

    CONSTRAINT "email_campaigns_pkey" PRIMARY KEY ("emailId","campaignId")
);

-- CreateIndex
CREATE UNIQUE INDEX "emails_hash_key" ON "emails"("hash");

-- AddForeignKey
ALTER TABLE "email_ips" ADD CONSTRAINT "email_ips_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_domains" ADD CONSTRAINT "email_domains_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_urls" ADD CONSTRAINT "email_urls_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "emails"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
