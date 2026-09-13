import { describe, it, expect } from "vitest";
import { parseEml } from "../lib/parse-email";

const MINIMAL_EML = `From: attacker@phishing-domain.com
To: victim@example.com
Subject: Urgent: Verify your account
Message-ID: <abc123@phishing-domain.com>
Date: Mon, 13 Sep 2026 10:00:00 +0000
MIME-Version: 1.0
Received: from mail.phishing-domain.com ([203.0.113.42])
  by mx.example.com with SMTP
Authentication-Results: mx.example.com;
  spf=fail smtp.mailfrom=phishing-domain.com;
  dkim=fail header.d=phishing-domain.com;
  dmarc=fail header.from=phishing-domain.com
Content-Type: text/plain

Click here to verify: http://evil.phishing-domain.com/verify?token=abc
`;

describe("parseEml", () => {
  it("extracts sender and subject", async () => {
    const result = await parseEml(MINIMAL_EML);
    expect(result.sender).toBe("attacker@phishing-domain.com");
    expect(result.subject).toBe("Urgent: Verify your account");
    expect(result.senderDomain).toBe("phishing-domain.com");
  });

  it("extracts relay hops and identifies public IPs", async () => {
    const result = await parseEml(MINIMAL_EML);
    const publicHops = result.hops.filter((h) => !h.isPrivate);
    expect(publicHops.length).toBeGreaterThanOrEqual(1);
    expect(publicHops.some((h) => h.ip === "203.0.113.42")).toBe(true);
  });

  it("parses SPF/DKIM/DMARC from Authentication-Results", async () => {
    const result = await parseEml(MINIMAL_EML);
    expect(result.auth.spf).toBe("fail");
    expect(result.auth.dkim).toBe("fail");
    expect(result.auth.dmarc).toBe("fail");
  });

  it("extracts URLs from body", async () => {
    const result = await parseEml(MINIMAL_EML);
    expect(result.urls).toContain(
      "http://evil.phishing-domain.com/verify?token=abc"
    );
  });

  it("generates consistent hash for same email", async () => {
    const r1 = await parseEml(MINIMAL_EML);
    const r2 = await parseEml(MINIMAL_EML);
    expect(r1.hash).toBe(r2.hash);
  });

  it("throws on missing From address", async () => {
    const badEml = MINIMAL_EML.replace(
      "From: attacker@phishing-domain.com\n",
      ""
    );
    await expect(parseEml(badEml)).rejects.toThrow("Invalid .eml");
  });

  it("marks private IPs correctly", async () => {
    const emlWithPrivateIp = MINIMAL_EML.replace(
      "([203.0.113.42])",
      "([192.168.1.1])"
    );
    const result = await parseEml(emlWithPrivateIp);
    const hop = result.hops.find((h) => h.ip === "192.168.1.1");
    expect(hop?.isPrivate).toBe(true);
  });
});
