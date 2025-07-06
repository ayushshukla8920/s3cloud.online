import crypto from "crypto";
import { NextResponse } from "next/server";

const SECRET_KEY = process.env.CAP_SECRET;
const IV = crypto.randomBytes(16);

function encryptAES256(text) {
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(SECRET_KEY), IV);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return {
    iv: IV.toString("hex"),
    encryptedData: encrypted.toString("hex"),
  };
}

export const POST = async(req) => {
  const { domain, amount } = await req.json();
  console.log("Encrypting checkout for:", domain, "with amount:", amount);
  if (!domain || !amount) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const domainEnc = encryptAES256(domain);
  const amountEnc = encryptAES256(amount.toString());

  return NextResponse.json({
    domain: domainEnc.encryptedData,
    amount: amountEnc.encryptedData,
    iv: domainEnc.iv,
  }, { status: 200 });
}
