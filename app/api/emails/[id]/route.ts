import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const email = await prisma.email.findUnique({
    where: { id: params.id },
    include: {
      ips: { orderBy: { isOriginating: "desc" } },
      domains: true,
      urls: true,
      campaigns: {
        include: {
          campaign: {
            include: {
              emails: { select: { emailId: true } },
            },
          },
        },
      },
    },
  });

  if (!email) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(email);
}
