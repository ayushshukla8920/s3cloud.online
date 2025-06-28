import { NextResponse } from "next/server";
import axios from "axios";
import prisma from "@/lib/prisma";
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

export const POST = async (req) => {
  try {
    const body = await req.json();

    if (!body.jwt || !body.alias) {
      return NextResponse.json({ err: "Invalid Request" }, { status: 400 });
    }

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
      where: { email: userEmail }
    });

    if (!user) {
      return NextResponse.json({ err: "User not found" }, { status: 404 });
    }

    // 🌐 Add DNS record via Cloudflare
    const dnsData = {
      name: body.alias,
      ttl: 60,
      type: "A",
      comment: "Domain Registered by "+userEmail,
      content: "0.0.0.0",
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
      return NextResponse.json({ err: "Failed to create DNS record" }, { status: 500 });
    }

    // 💾 Save to DB
    await prisma.subdomain.create({
      data: {
        subdomain: body.alias,
        ip: body.ipaddr,
        recordId: recordId,
        user: {
          connect: { id: user.id }
        }
      }
    });

    return NextResponse.json({ msg: "Subdomain created and DNS added" }, { status: 200 });

  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ err: "Internal Server Error" }, { status: 500 });
  }
};
