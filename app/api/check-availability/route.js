import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
const forbiddenSubdomains = [
  'www', 'mail', 'smtp', 'imap', 'ftp', 'webmail',
  'autoconfig', 'autodiscover', 'cpanel', 'admin',
  'test', 'api', 'ns1', 'ns2', 'root', '*', 'localhost','mx'
];
export const POST = async (req) => {
  try {
    const body = await req.json();
    if (!body.alias || typeof body.alias !== "string") {
      return NextResponse.json({ err: "Alias is required" }, { status: 400 });
    }
    const alias = body.alias.slice(0, -15);
    const normalized = alias.toLowerCase();
    if (normalized.includes("*") || normalized.includes(".") || normalized.includes(" ")) {
      return NextResponse.json({
        available: false,
        message: "Not Allowed",
      });
    }
    if (forbiddenSubdomains.includes(normalized)) {
      return NextResponse.json({
        available: false,
        message: "Not Allowed",
      });
    }
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
    if (!subdomainRegex.test(normalized)) {
      return NextResponse.json({
        available: false,
        message: "Not Allowed",
      });
    }
    // Check if subdomain exists
    const existing = await prisma.subdomain.findUnique({
      where: { subdomain: `${normalized}.s3cloud.online` },
    });
    if (existing) {
      return NextResponse.json({
        available: false,
        message: "Subdomain already taken",
      });
    } else {
      return NextResponse.json({
        available: true,
        message: "Subdomain is available",
      });
    }
  } catch (error) {
    console.error("Error checking subdomain:", error);
    return NextResponse.json({ err: "Internal Server Error" }, { status: 500 });
  }
};
