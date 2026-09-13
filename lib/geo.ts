export interface GeoResult {
  ip: string;
  country: string | null;
  asn: string | null;
  org: string | null;
}

export async function geolocateIps(ips: string[]): Promise<GeoResult[]> {
  const token = process.env.IPINFO_TOKEN;
  const baseUrl = "https://ipinfo.io";

  const results = await Promise.all(
    ips.map(async (ip): Promise<GeoResult> => {
      try {
        const url = token
          ? `${baseUrl}/${ip}?token=${token}`
          : `${baseUrl}/${ip}/json`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (!res.ok) return { ip, country: null, asn: null, org: null };
        const data = await res.json();
        return {
          ip,
          country: data.country ?? null,
          asn: data.org?.split(" ")[0] ?? null,
          org: data.org ?? null,
        };
      } catch {
        return { ip, country: null, asn: null, org: null };
      }
    })
  );

  return results;
}
