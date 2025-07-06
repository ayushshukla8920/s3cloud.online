// /pages/api/decrypt-checkout.ts
import crypto from "crypto";
import { NextResponse } from "next/server";

const SECRET_KEY = process.env.CAP_SECRET;

function decryptAES256(encrypted, iv) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(SECRET_KEY),
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(Buffer.from(encrypted, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export const POST = async(req)=>{
  const { d, a, iv } = await req.json();
  try {
    const domain = decryptAES256(d, iv);
    const amount = decryptAES256(a, iv);
    return NextResponse.json({ domain, amount }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to decrypt data" }, { status: 500 });
  }
}
