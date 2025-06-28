import { NextResponse } from "next/server";
import { decryptCaptcha } from "@/lib/captcha";

export async function POST(req) {
  const { userInput, encrypted } = await req.json();
  try {
    const original = decryptCaptcha(encrypted);
    if (original.toLowerCase() === userInput.toLowerCase()) {
      console.log("Captcha Validation Success")
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid CAPTCHA" },
        { status: 200 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Decryption error" },
      { status: 400 }
    );
  }
}
