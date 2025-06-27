import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export const POST = async (req) => {
  try {
    const body = await req.json();

    if (!body.jwt) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // 🔐 Verify token
    let decoded;
    try {
      decoded = jwt.verify(body.jwt, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const email = decoded;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const domains = await prisma.subdomain.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        subdomain: true,
        ip: true,
        recordId: true,
        createdAt: true,
      },
    });
    const enrichedDomains = domains.map((d) => ({
      ...d,
      status: d.status || "active",
    }));

    return NextResponse.json({ domains: enrichedDomains }, { status: 200 });

  } catch (error) {
    console.error("API Error - /my-domains:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
