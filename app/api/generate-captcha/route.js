import { NextResponse } from "next/server";
import { encryptCaptcha, generateCaptchaSVG } from "@/lib/captcha";

export const GET = async()=>{
  const svg = generateCaptchaSVG();
  const encryptedText = encryptCaptcha(svg.text);
  return NextResponse.json({ image: svg.svg, text: encryptedText  });
}
