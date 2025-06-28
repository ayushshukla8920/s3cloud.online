import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const forbiddenSubdomains = [
  'www', 'mail', 'smtp', 'imap', 'ftp', 'webmail',
  'autoconfig', 'autodiscover', 'cpanel', 'admin',
  'test', 'api', 'ns1', 'ns2', 'root', '*', 'localhost', 'mx'
];

export const POST = async (req) => {
  try {
    const body = await req.json();
    let alias = body.alias?.toLowerCase();
    if (!alias || typeof alias !== "string") {
      return NextResponse.json({ err: "Alias is required" }, { status: 400 });
    }
    if (alias.endsWith(".s3cloud.online")) {
      alias = alias.replace(".s3cloud.online", "");
    }
    if (
      forbiddenSubdomains.includes(alias) ||
      alias.includes("*") ||
      alias.includes(".") ||
      alias.includes(" ") ||
      alias.length > 63
    ) {
      return NextResponse.json({
        available: false,
        message: "Not Allowed",
      });
    }
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
    if (!subdomainRegex.test(alias)) {
      return NextResponse.json({
        available: false,
        message: "Not Allowed",
      });
    }
    const fullSubdomain = `${alias}.s3cloud.online`;
    const existing = await prisma.subdomain.findUnique({
      where: { subdomain: fullSubdomain },
    });
    if (existing) {
      return NextResponse.json({
        available: false,
        message: "Subdomain already taken",
      });
    }
    return NextResponse.json({
      available: true,
      message: "Subdomain is available",
    });
  } catch (error) {
    console.error("Error checking subdomain:", error);
    return NextResponse.json(
      { err: "Internal Server Error" },
      { status: 500 }
    );
  }
};
