import { simpleParser, ParsedMail } from "mailparser";
import { createHash } from "crypto";

export interface RelayHop {
  ip: string;
  isPrivate: boolean;
}

export interface AuthStatus {
  spf: "pass" | "fail" | "none";
  dkim: "pass" | "fail" | "none";
  dmarc: "pass" | "fail" | "none";
}

export interface ParsedEmail {
  hash: string;
  subject: string;
  sender: string;
  senderDomain: string;
  body: string;
  hops: RelayHop[];
  auth: AuthStatus;
  urls: string[];
  raw: ParsedMail;
}

const PRIVATE_IP_RE =
  /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|::1$|fc00:|fd)/;

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_RE.test(ip);
}

function extractIpsFromReceived(headers: ParsedMail["headers"]): RelayHop[] {
  const received = headers.get("received");
  if (!received) return [];

  const values: string[] = Array.isArray(received)
    ? received.map((h) => (typeof h === "string" ? h : h.value ?? ""))
    : [typeof received === "string" ? received : ""];

  const hops: RelayHop[] = [];
  const ipRe = /\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/g;

  for (const val of values) {
    let match: RegExpExecArray | null;
    while ((match = ipRe.exec(val)) !== null) {
      const ip = match[1];
      if (!hops.some((h) => h.ip === ip)) {
        hops.push({ ip, isPrivate: isPrivateIp(ip) });
      }
    }
  }

  return hops;
}

function parseAuthResults(headers: ParsedMail["headers"]): AuthStatus {
  const header = headers.get("authentication-results");
  const raw: string = Array.isArray(header)
    ? header.map((h) => (typeof h === "string" ? h : h.value ?? "")).join(" ")
    : typeof header === "string"
    ? header
    : "";

  const get = (key: "spf" | "dkim" | "dmarc"): AuthStatus["spf"] => {
    const re = new RegExp(`${key}=([a-z]+)`, "i");
    const m = raw.match(re);
    if (!m) return "none";
    if (m[1].toLowerCase() === "pass") return "pass";
    return "fail";
  };

  return { spf: get("spf"), dkim: get("dkim"), dmarc: get("dmarc") };
}

function extractUrls(text: string): string[] {
  const re = /https?:\/\/[^\s<>"']+/g;
  return Array.from(new Set(text.match(re) ?? []));
}

export async function parseEml(rawEml: string): Promise<ParsedEmail> {
  const parsed = await simpleParser(rawEml);

  const from = parsed.from?.value?.[0];
  if (!from?.address) {
    throw new Error("Invalid .eml: missing From address");
  }
  if (!parsed.messageId) {
    throw new Error("Invalid .eml: missing Message-ID");
  }

  const sender = from.address;
  const senderDomain = sender.split("@")[1] ?? "";
  const subject = parsed.subject ?? "(no subject)";
  const htmlText =
    typeof parsed.html === "string"
      ? parsed.html.replace(/<[^>]+>/g, " ")
      : "";
  const body = parsed.text ?? htmlText;

  const hash = createHash("sha256").update(rawEml).digest("hex");
  const hops = extractIpsFromReceived(parsed.headers);
  const auth = parseAuthResults(parsed.headers);
  const htmlRaw = typeof parsed.html === "string" ? parsed.html : "";
  const urls = extractUrls(body + " " + htmlRaw);

  return { hash, subject, sender, senderDomain, body, hops, auth, urls, raw: parsed };
}
