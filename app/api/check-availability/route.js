import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const POST = async (req) => {
  try {
    const body = await req.json();
    const { alias } = body;

    if (!alias || typeof alias !== "string") {
      return NextResponse.json({ err: "Alias is required" }, { status: 400 });
    }

    // Check if subdomain exists
    const existing = await prisma.subdomain.findUnique({
      where: { subdomain: `${alias}.s3cloud.online` }
    });

    if (existing) {
      return NextResponse.json({ available: false, message: "Subdomain already taken" });
    } else {
      return NextResponse.json({ available: true, message: "Subdomain is available" });
    }

  } catch (error) {
    console.error("Error checking subdomain:", error);
    return NextResponse.json({ err: "Internal Server Error" }, { status: 500 });
  }
};
