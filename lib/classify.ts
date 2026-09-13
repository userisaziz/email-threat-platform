export interface ClassifyResult {
  phishingScore: number | null;
  available: boolean;
}

export async function classifyPhishing(
  subject: string,
  body: string
): Promise<ClassifyResult> {
  const token = process.env.HF_TOKEN;
  if (!token) return { phishingScore: null, available: false };

  const text = `Subject: ${subject}\n\n${body}`.slice(0, 1024);

  const attempt = async (): Promise<ClassifyResult> => {
    const res = await fetch(
      "https://api-inference.huggingface.co/models/facebook/bart-large-mnli",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: text,
          parameters: { candidate_labels: ["phishing", "legitimate"] },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (res.status === 503) return null as unknown as ClassifyResult;
    if (!res.ok) return { phishingScore: null, available: false };

    const data = await res.json();
    const idx = (data.labels as string[]).indexOf("phishing");
    const score = idx !== -1 ? (data.scores as number[])[idx] : null;
    return { phishingScore: score, available: true };
  };

  try {
    const first = await attempt();
    if (first === null) {
      // 503 cold start — retry once after 3s
      await new Promise((r) => setTimeout(r, 3000));
      const second = await attempt();
      if (second === null) return { phishingScore: null, available: false };
      return second;
    }
    return first;
  } catch {
    return { phishingScore: null, available: false };
  }
}
