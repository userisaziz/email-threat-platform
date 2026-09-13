import { whoisDomain } from "whoiser";

export interface WhoisResult {
  ageDays: number | null;
  registrar: string | null;
}

export async function lookupWhois(domain: string): Promise<WhoisResult> {
  try {
    const result = await Promise.race([
      whoisDomain(domain, { follow: 1 }),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 5000)
      ),
    ]);

    if (!result) return { ageDays: null, registrar: null };

    // whoiser returns an object keyed by WHOIS server
    const first = Object.values(result as Record<string, Record<string, unknown>>)[0];
    if (!first) return { ageDays: null, registrar: null };

    const createdRaw =
      first["Created Date"] ??
      first["Creation Date"] ??
      first["Registered On"] ??
      null;

    let ageDays: number | null = null;
    if (createdRaw) {
      const created = new Date(String(createdRaw));
      if (!isNaN(created.getTime())) {
        ageDays = Math.floor(
          (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
    }

    const registrar =
      (first["Registrar"] as string | undefined) ??
      (first["Registrar Name"] as string | undefined) ??
      null;

    return { ageDays, registrar };
  } catch {
    return { ageDays: null, registrar: null };
  }
}
