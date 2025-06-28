import { NextResponse } from "next/server";
import axios from "axios";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

export const POST = async (req) => {
  try {
    const body = await req.json();

    const { jwt: token, alias, ipaddr, record_id } = body;

    if (!token || !alias || !ipaddr || !record_id) {
      return NextResponse.json({ err: "Missing fields" }, { status: 400 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ err: "Invalid or expired token" }, { status: 401 });
    }

    const userEmail = decoded;

    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ err: "User not found" }, { status: 404 });
    }

    const subdomain = await prisma.subdomain.findFirst({
      where: {
        subdomain: alias,
        recordId: record_id,
        userId: user.id,
      },
    });

    if (!subdomain) {
      return NextResponse.json({ err: "Unauthorized or subdomain not found" }, { status: 403 });
    }

    const dnsData = {
      name: alias,
      ttl: 60,
      type: "A",
      comment: "Domain Registered by "+userEmail,
      content: ipaddr,
      proxied: false,
    };

    const config = {
      method: "patch",
      url: `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records/${record_id}`,
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Email": process.env.CLOUDFLARE_EMAIL,
        "X-Auth-Key": process.env.CLOUDFLARE_API_KEY,
      },
      data: JSON.stringify(dnsData),
    };

    const response = await axios.request(config);

    await prisma.subdomain.update({
      where: { id: subdomain.id },
      data: { ip: ipaddr },
    });

    return NextResponse.json({ msg: "DNS and database updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("Error updating DNS:", error?.response?.data || error.message);
    return NextResponse.json({ err: "Internal Server Error" }, { status: 500 });
  }
};
