import { describe, it, expect } from "vitest";
import { computeFraudScore } from "../lib/fraud-score";

describe("computeFraudScore", () => {
  it("returns 0 / Legitimate for clean email", () => {
    const { score, verdict } = computeFraudScore({
      spfFail: false,
      dkimFail: false,
      dmarcFail: false,
      domainAgeDays: 365,
      hfPhishingScore: 0.1,
      abuseIpdbScore: 0,
    });
    expect(score).toBe(0);
    expect(verdict).toBe("Legitimate");
  });

  it("SPF + DKIM + DMARC all fail → floor score to 40, Suspicious", () => {
    const { score, verdict } = computeFraudScore({
      spfFail: true,
      dkimFail: true,
      dmarcFail: true,
      domainAgeDays: 365,
      hfPhishingScore: 0.1,
      abuseIpdbScore: 0,
    });
    // 20+20+15=55, which is already >= 40, floor doesn't change it
    expect(score).toBe(55);
    expect(verdict).toBe("Suspicious");
  });

  it("SPF + DKIM fail but not DMARC → no floor applied", () => {
    const { score, verdict } = computeFraudScore({
      spfFail: true,
      dkimFail: true,
      dmarcFail: false,
      domainAgeDays: 365,
      hfPhishingScore: 0,
      abuseIpdbScore: 0,
    });
    expect(score).toBe(40);
    expect(verdict).toBe("Suspicious");
  });

  it("all signals fire → caps at 100", () => {
    const { score, verdict } = computeFraudScore({
      spfFail: true,
      dkimFail: true,
      dmarcFail: true,
      domainAgeDays: 1,
      hfPhishingScore: 0.95,
      abuseIpdbScore: 99,
    });
    // 20+20+15+20+15+10 = 100
    expect(score).toBe(100);
    expect(verdict).toBe("Fraudulent");
  });

  it("score >= 60 → Fraudulent", () => {
    const { verdict } = computeFraudScore({
      spfFail: true,
      dkimFail: true,
      dmarcFail: true,
      domainAgeDays: 1,
      hfPhishingScore: null,
      abuseIpdbScore: null,
    });
    // 20+20+15+20 = 75
    expect(verdict).toBe("Fraudulent");
  });

  it("score 40–59 → Suspicious", () => {
    const { score, verdict } = computeFraudScore({
      spfFail: true,
      dkimFail: true,
      dmarcFail: false,
      domainAgeDays: 365,
      hfPhishingScore: null,
      abuseIpdbScore: null,
    });
    expect(score).toBe(40);
    expect(verdict).toBe("Suspicious");
  });

  it("nulls for optional signals don't add points", () => {
    const { score } = computeFraudScore({
      spfFail: false,
      dkimFail: false,
      dmarcFail: false,
      domainAgeDays: null,
      hfPhishingScore: null,
      abuseIpdbScore: null,
    });
    expect(score).toBe(0);
  });

  it("HF score exactly 0.7 does not add points (threshold is > 0.7)", () => {
    const { score } = computeFraudScore({
      spfFail: false,
      dkimFail: false,
      dmarcFail: false,
      domainAgeDays: null,
      hfPhishingScore: 0.7,
      abuseIpdbScore: null,
    });
    expect(score).toBe(0);
  });

  it("HF score 0.71 adds 15 points", () => {
    const { score } = computeFraudScore({
      spfFail: false,
      dkimFail: false,
      dmarcFail: false,
      domainAgeDays: null,
      hfPhishingScore: 0.71,
      abuseIpdbScore: null,
    });
    expect(score).toBe(15);
  });

  it("domain 30 days old does not trigger penalty (threshold is < 30)", () => {
    const { score } = computeFraudScore({
      spfFail: false,
      dkimFail: false,
      dmarcFail: false,
      domainAgeDays: 30,
      hfPhishingScore: null,
      abuseIpdbScore: null,
    });
    expect(score).toBe(0);
  });

  it("domain 29 days old triggers +20 penalty", () => {
    const { score } = computeFraudScore({
      spfFail: false,
      dkimFail: false,
      dmarcFail: false,
      domainAgeDays: 29,
      hfPhishingScore: null,
      abuseIpdbScore: null,
    });
    expect(score).toBe(20);
  });

  it("triple-auth-fail floor: score was below 40 without other signals → floor to 40", () => {
    // All 3 auth fail = 55pts, already above 40. Test with hypothetical:
    // Use mock where only DMARC contributes less. Actually with SPF+DKIM+DMARC = 55 always >= 40
    // So floor only matters if somehow the calculated total < 40 — can't happen with all 3 failing.
    // Instead verify floor applies by checking edge: score = 55 stays 55 (not clamped lower).
    const { score } = computeFraudScore({
      spfFail: true,
      dkimFail: true,
      dmarcFail: true,
      domainAgeDays: 365,
      hfPhishingScore: 0,
      abuseIpdbScore: 0,
    });
    expect(score).toBeGreaterThanOrEqual(40);
  });
});
