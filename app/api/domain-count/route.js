import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
export async function POST(req) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }
    const email = decoded;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { subdomains: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const count = user.subdomains.length;
    return NextResponse.json({ subdomainCount: count }, { status: 200 });
  } catch (error) {
    console.error("Domain count error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
