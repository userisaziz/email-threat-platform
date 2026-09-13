import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { ForensicReport } from "@/lib/pdf/report";
import type { DocumentProps } from "@react-pdf/renderer";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const email = await prisma.email.findUnique({
    where: { id: params.id },
    include: {
      ips: { orderBy: { isOriginating: "desc" } },
      domains: true,
      urls: { take: 50 },
      campaigns: {
        include: {
          campaign: {
            include: { emails: { select: { emailId: true } } },
          },
        },
      },
    },
  });

  if (!email) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const el = React.createElement(
    ForensicReport,
    { email }
  ) as React.ReactElement<DocumentProps>;

  const buffer = await renderToBuffer(el);
  const bytes = new Uint8Array(buffer);

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="report-${email.id.slice(-8)}.pdf"`,
    },
  });
}
