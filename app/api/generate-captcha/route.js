import { NextResponse } from "next/server";
import { encryptCaptcha, createCaptchaImage } from "@/lib/captcha";

export const GET = async()=>{
  const captcha = createCaptchaImage();
  const encryptedText = encryptCaptcha(captcha.text);
  return NextResponse.json({ image: captcha.data, text: encryptedText  });
}
