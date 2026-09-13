import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

type EmailWithRelations = {
  id: string;
  subject: string | null;
  sender: string;
  fraudScore: number;
  verdict: string;
  spf: string;
  dkim: string;
  dmarc: string;
  hfScore: number | null;
  analyzedAt: Date;
  ips: {
    ip: string;
    country: string | null;
    asn: string | null;
    org: string | null;
    abuseScore: number | null;
    isOriginating: boolean;
  }[];
  domains: {
    domain: string;
    whoisAgeDays: number | null;
    registrar: string | null;
  }[];
  urls: { url: string }[];
  campaigns: {
    campaign: {
      id: string;
      emails: { emailId: string }[];
    };
  }[];
};

const colors = {
  Fraudulent: "#ef4444",
  Suspicious: "#eab308",
  Legitimate: "#22c55e",
  bg: "#0f172a",
  surface: "#1e293b",
  border: "#334155",
  text: "#f1f5f9",
  muted: "#94a3b8",
  accent: "#ef4444",
};

const s = StyleSheet.create({
  page: {
    backgroundColor: colors.bg,
    color: colors.text,
    fontFamily: "Helvetica",
    fontSize: 10,
    padding: 40,
  },
  headerBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
    marginBottom: 20,
  },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: colors.accent },
  subtitle: { fontSize: 10, color: colors.muted, marginTop: 2 },
  section: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },
  sectionHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionBody: { paddingHorizontal: 12, paddingVertical: 10 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 130, color: colors.muted, fontSize: 9 },
  value: { flex: 1, color: colors.text },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  col1: { width: "22%", fontSize: 8, fontFamily: "Helvetica" },
  col2: { width: "12%", fontSize: 8 },
  col3: { width: "20%", fontSize: 8 },
  col4: { width: "32%", fontSize: 8 },
  col5: { width: "14%", fontSize: 8 },
  colHead: { color: colors.muted, fontSize: 7, fontFamily: "Helvetica-Bold" },
  chip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 8,
    marginRight: 4,
  },
  verdictBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
  },
  verdictLabel: { fontSize: 22, fontFamily: "Helvetica-Bold" },
  scoreLabel: { fontSize: 32, fontFamily: "Helvetica-Bold" },
  mono: { fontFamily: "Helvetica" },
  muted: { color: colors.muted },
  danger: { color: colors.Fraudulent },
  warn: { color: colors.Suspicious },
  safe: { color: colors.Legitimate },
  urlText: { fontSize: 7, color: colors.muted, marginBottom: 2 },
  iocBlock: { marginTop: 6 },
  iocLabel: { fontSize: 8, color: colors.muted, marginBottom: 3 },
  tag: {
    fontSize: 7,
    fontFamily: "Helvetica",
    backgroundColor: colors.surface,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginRight: 3,
    marginBottom: 3,
    borderRadius: 2,
  },
  tagRow: { flexDirection: "row", flexWrap: "wrap" },
});

function verdictStyle(verdict: string): { backgroundColor: string; color: string } {
  if (verdict === "Fraudulent")
    return { backgroundColor: "#450a0a", color: colors.Fraudulent };
  if (verdict === "Suspicious")
    return { backgroundColor: "#422006", color: colors.Suspicious };
  return { backgroundColor: "#052e16", color: colors.Legitimate };
}


export function ForensicReport({ email }: { email: EmailWithRelations }) {
  const campaign = email.campaigns[0]?.campaign;
  const domain = email.domains[0];
  const originatingIp = email.ips.find((ip) => ip.isOriginating) ?? email.ips[0];

  return (
    <Document
      title={`Forensic Report — ${email.subject ?? "Email"}`}
      author="EmailThreat Intelligence Platform"
    >
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerBar}>
          <Text style={s.title}>⚠ EmailThreat Forensic Report</Text>
          <Text style={s.subtitle}>
            Generated: {new Date().toUTCString()} | ID: {email.id}
          </Text>
        </View>

        {/* Section 1: Executive Summary */}
        <View style={[s.verdictBox, verdictStyle(email.verdict)]}>
          <View>
            <Text style={{ fontSize: 8, color: colors.muted, marginBottom: 4 }}>
              VERDICT
            </Text>
            <Text style={s.verdictLabel}>{email.verdict}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 8, color: colors.muted, marginBottom: 4 }}>
              FRAUD SCORE
            </Text>
            <Text style={s.scoreLabel}>{email.fraudScore} / 100</Text>
          </View>
        </View>

        {/* Section 2: Email Header Analysis */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Email Header Analysis</Text>
          </View>
          <View style={s.sectionBody}>
            <View style={s.row}>
              <Text style={s.label}>From</Text>
              <Text style={s.value}>{email.sender}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.label}>Subject</Text>
              <Text style={s.value}>{email.subject ?? "(no subject)"}</Text>
            </View>
            <View style={s.row}>
              <Text style={s.label}>Analyzed At</Text>
              <Text style={s.value}>
                {new Date(email.analyzedAt).toUTCString()}
              </Text>
            </View>
            <View style={s.row}>
              <Text style={s.label}>Relay Hops Found</Text>
              <Text style={s.value}>{email.ips.length} public IP(s)</Text>
            </View>
            {originatingIp && (
              <View style={s.row}>
                <Text style={s.label}>Originating IP</Text>
                <Text style={s.value}>
                  {originatingIp.ip} ({originatingIp.country ?? "unknown"})
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Section 3: Authentication */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Authentication Status (SPF / DKIM / DMARC)</Text>
          </View>
          <View style={s.sectionBody}>
            <View style={s.tableHeader}>
              <Text style={[{ width: "20%" }, s.colHead]}>CHECK</Text>
              <Text style={[{ width: "20%" }, s.colHead]}>RESULT</Text>
              <Text style={[{ width: "60%" }, s.colHead]}>SCORE IMPACT</Text>
            </View>
            {[
              { label: "SPF", status: email.spf, impact: "fail = +20 pts" },
              { label: "DKIM", status: email.dkim, impact: "fail = +20 pts" },
              { label: "DMARC", status: email.dmarc, impact: "fail = +15 pts" },
            ].map((row) => (
              <View key={row.label} style={s.tableRow}>
                <Text style={{ width: "20%", fontSize: 9, fontFamily: "Helvetica-Bold" }}>
                  {row.label}
                </Text>
                <Text
                  style={[
                    { width: "20%", fontSize: 9 },
                    row.status === "pass" ? s.safe : row.status === "fail" ? s.danger : s.muted,
                  ]}
                >
                  {row.status.toUpperCase()}
                </Text>
                <Text style={[{ width: "60%", fontSize: 8 }, s.muted]}>{row.impact}</Text>
              </View>
            ))}
            {email.hfScore !== null && (
              <View style={[s.row, { marginTop: 8 }]}>
                <Text style={s.label}>AI Phishing Score</Text>
                <Text
                  style={[s.value, email.hfScore > 0.7 ? s.danger : s.safe]}
                >
                  {(email.hfScore * 100).toFixed(0)}%
                  {email.hfScore > 0.7 ? " (contributes +15 pts)" : ""}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Section 4: Geolocation Trace */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>
              Geolocation Trace — {email.ips.length} Relay Hop(s)
            </Text>
          </View>
          <View style={s.sectionBody}>
            {email.ips.length === 0 ? (
              <Text style={s.muted}>No public IP addresses found in relay chain.</Text>
            ) : (
              <>
                <View style={s.tableHeader}>
                  <Text style={[s.col1, s.colHead]}>IP ADDRESS</Text>
                  <Text style={[s.col2, s.colHead]}>COUNTRY</Text>
                  <Text style={[s.col3, s.colHead]}>ASN</Text>
                  <Text style={[s.col4, s.colHead]}>ORGANIZATION</Text>
                  <Text style={[s.col5, s.colHead]}>ABUSE %</Text>
                </View>
                {email.ips.map((ip, i) => (
                  <View
                    key={i}
                    style={[
                      s.tableRow,
                      ip.isOriginating ? { backgroundColor: "#1a0000" } : {},
                    ]}
                  >
                    <Text style={[s.col1, ip.isOriginating ? s.danger : {}]}>
                      {ip.ip}
                      {ip.isOriginating ? " *" : ""}
                    </Text>
                    <Text style={s.col2}>{ip.country ?? "—"}</Text>
                    <Text style={s.col3}>{ip.asn ?? "—"}</Text>
                    <Text style={s.col4}>{ip.org ?? "—"}</Text>
                    <Text
                      style={[
                        s.col5,
                        ip.abuseScore !== null && ip.abuseScore > 50
                          ? s.danger
                          : {},
                      ]}
                    >
                      {ip.abuseScore !== null ? `${ip.abuseScore}%` : "—"}
                    </Text>
                  </View>
                ))}
                <Text style={[s.muted, { fontSize: 7, marginTop: 4 }]}>
                  * Originating IP
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Section 5: Domain Intelligence */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Domain Intelligence</Text>
          </View>
          <View style={s.sectionBody}>
            {domain ? (
              <>
                <View style={s.row}>
                  <Text style={s.label}>Sender Domain</Text>
                  <Text style={s.value}>{domain.domain}</Text>
                </View>
                <View style={s.row}>
                  <Text style={s.label}>Domain Age</Text>
                  <Text
                    style={[
                      s.value,
                      domain.whoisAgeDays !== null && domain.whoisAgeDays < 30
                        ? s.danger
                        : {},
                    ]}
                  >
                    {domain.whoisAgeDays !== null
                      ? `${domain.whoisAgeDays} days${domain.whoisAgeDays < 30 ? " ⚠ NEWLY REGISTERED" : ""}`
                      : "unknown"}
                  </Text>
                </View>
                <View style={s.row}>
                  <Text style={s.label}>Registrar</Text>
                  <Text style={s.value}>{domain.registrar ?? "unknown"}</Text>
                </View>
              </>
            ) : (
              <Text style={s.muted}>No WHOIS data available.</Text>
            )}
          </View>
        </View>

        {/* Section 6: NLP Analysis */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>NLP Phishing Analysis</Text>
          </View>
          <View style={s.sectionBody}>
            <Text style={{ marginBottom: 4 }}>
              Model: facebook/bart-large-mnli (zero-shot classification)
            </Text>
            <Text style={{ marginBottom: 4 }}>
              {`Labels: ["phishing", "legitimate"]`}
            </Text>
            <Text style={s.muted}>
              The NLP phishing confidence score contributes +15 to fraud score when {">"} 0.70.
              Full score available in the API result (stored with email record).
            </Text>
          </View>
        </View>

        {/* Section 7: Campaign Attribution */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Campaign Attribution</Text>
          </View>
          <View style={s.sectionBody}>
            {campaign ? (
              <>
                <View style={s.row}>
                  <Text style={s.label}>Campaign ID</Text>
                  <Text style={[s.value, s.danger]}>#{campaign.id.slice(-6)}</Text>
                </View>
                <View style={s.row}>
                  <Text style={s.label}>Emails in Campaign</Text>
                  <Text style={s.value}>{campaign.emails.length}</Text>
                </View>
                {originatingIp?.org && (
                  <View style={s.row}>
                    <Text style={s.label}>Originating Network</Text>
                    <Text style={s.value}>
                      {originatingIp.asn} ({originatingIp.org})
                    </Text>
                  </View>
                )}
                <Text style={[s.muted, { fontSize: 8, marginTop: 4 }]}>
                  Correlation method: union-find on shared originating IPs and sender domains.
                </Text>
              </>
            ) : (
              <Text style={s.muted}>
                No campaign match. This email does not share IPs or domains with other
                analyzed emails in the database.
              </Text>
            )}
          </View>
        </View>

        {/* Section 8: Indicators of Compromise */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Indicators of Compromise</Text>
          </View>
          <View style={s.sectionBody}>
            {email.ips.length > 0 && (
              <View style={s.iocBlock}>
                <Text style={s.iocLabel}>IP ADDRESSES ({email.ips.length})</Text>
                <View style={s.tagRow}>
                  {email.ips.map((ip, i) => (
                    <Text key={i} style={s.tag}>{ip.ip}</Text>
                  ))}
                </View>
              </View>
            )}

            {email.domains.length > 0 && (
              <View style={s.iocBlock}>
                <Text style={s.iocLabel}>DOMAINS ({email.domains.length})</Text>
                <View style={s.tagRow}>
                  {email.domains.map((d, i) => (
                    <Text key={i} style={s.tag}>{d.domain}</Text>
                  ))}
                </View>
              </View>
            )}

            {email.urls.length > 0 && (
              <View style={s.iocBlock}>
                <Text style={s.iocLabel}>URLS ({email.urls.length})</Text>
                {email.urls.slice(0, 20).map((u, i) => (
                  <Text key={i} style={s.urlText}>{u.url}</Text>
                ))}
                {email.urls.length > 20 && (
                  <Text style={[s.muted, { fontSize: 7 }]}>
                    ... and {email.urls.length - 20} more
                  </Text>
                )}
              </View>
            )}

            {email.ips.length === 0 && email.domains.length === 0 && email.urls.length === 0 && (
              <Text style={s.muted}>No indicators of compromise extracted.</Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8 }}>
          <Text style={[s.muted, { fontSize: 7 }]}>
            Generated by EmailThreat Intelligence Platform | For investigative use only |
            Report ID: {email.id}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
