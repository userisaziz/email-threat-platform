export interface FraudSignals {
  spfFail: boolean;
  dkimFail: boolean;
  dmarcFail: boolean;
  domainAgeDays: number | null;
  hfPhishingScore: number | null;
  abuseIpdbScore: number | null;
}

export type Verdict = "Legitimate" | "Suspicious" | "Fraudulent";

export function computeFraudScore(signals: FraudSignals): {
  score: number;
  verdict: Verdict;
} {
  let score = 0;

  if (signals.spfFail) score += 20;
  if (signals.dkimFail) score += 20;
  if (signals.dmarcFail) score += 15;
  if (signals.domainAgeDays !== null && signals.domainAgeDays < 30) score += 20;
  if (signals.hfPhishingScore !== null && signals.hfPhishingScore > 0.7)
    score += 15;
  if (signals.abuseIpdbScore !== null && signals.abuseIpdbScore > 50)
    score += 10;

  score = Math.min(100, score);

  // All three auth checks fail → floor to Suspicious
  if (signals.spfFail && signals.dkimFail && signals.dmarcFail) {
    score = Math.max(40, score);
  }

  let verdict: Verdict;
  if (score >= 60) verdict = "Fraudulent";
  else if (score >= 40) verdict = "Suspicious";
  else verdict = "Legitimate";

  return { score, verdict };
}
