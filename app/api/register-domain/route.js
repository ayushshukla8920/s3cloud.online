import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const forbiddenSubdomains = [
  "www", "mail", "smtp", "imap", "ftp", "webmail", "autoconfig", "autodiscover",
  "cpanel", "admin", "test", "api", "ns1", "ns2", "root", "*", "localhost", "mx",
];

export const POST = async (req) => {
  try {
    const body = await req.json();

    if (!body.jwt || !body.alias) {
      return NextResponse.json({ err: "Invalid Request" }, { status: 400 });
    }

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
      return NextResponse.json({ err: "Invalid Subdomain" }, { status: 400 });
    }

    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
    if (!subdomainRegex.test(alias)) {
      return NextResponse.json({ err: "Invalid Subdomain" }, { status: 400 });
    }

    const fullSubdomain = `${alias}.s3cloud.online`;

    // 🔐 Verify and decode JWT
    let decoded;
    try {
      decoded = jwt.verify(body.jwt, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ err: "Invalid or expired token" }, { status: 401 });
    }

    const userEmail = decoded;
    
    // ✅ Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { subdomains: true },
    });

    if (!user) {
      return NextResponse.json({ err: "User not found" }, { status: 404 });
    }

    // 💳 Check if payment is required
    const hasPayment = Boolean(body.paymentId);
    const currentSubdomainCount = user.subdomains.length;

    if (!hasPayment && currentSubdomainCount >= 5) {
      return NextResponse.json(
        { err: "Payment required: Free users can only register up to 5 subdomains" },
        { status: 402 }
      );
    }

    // 🌐 Add DNS record via Cloudflare
    const dnsData = {
      name: fullSubdomain,
      ttl: 60,
      type: "A",
      comment: "Domain Registered by " + userEmail,
      content: body.ipaddr || "0.0.0.0",
      proxied: false,
    };

    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`,
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Email": process.env.CLOUDFLARE_EMAIL,
        "X-Auth-Key": process.env.CLOUDFLARE_API_KEY,
      },
      data: JSON.stringify(dnsData),
    };

    const response = await axios.request(config);
    const recordId = response.data?.result?.id;

    if (!recordId) {
      return NextResponse.json(
        { err: "Failed to create DNS record" },
        { status: 500 }
      );
    }

    // 💾 Save subdomain to DB
    await prisma.subdomain.create({
      data: {
        subdomain: fullSubdomain,
        ip: body.ipaddr,
        recordId: recordId,
        user: {
          connect: { id: user.id },
        },
      },
    });

    // 🔄 Update subdomain count
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subdomainCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(
      { msg: "Subdomain created and DNS added" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ err: "Internal Server Error" }, { status: 500 });
  }
};
