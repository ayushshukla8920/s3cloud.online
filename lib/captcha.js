// lib/cryptoCaptcha.ts
import crypto from "crypto"
import { createCanvas, loadImage } from "canvas";
const secretKey = process.env.CAP_SECRET || "super-secure-fallback"
const algorithm = "aes-256-cbc"
const ivLength = 16

export function encryptCaptcha(text) {
  const iv = crypto.randomBytes(ivLength)
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "utf-8"), iv)
  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")
  return iv.toString("hex") + ":" + encrypted
}

export function decryptCaptcha(encrypted) {
  const [ivHex, encryptedText] = encrypted.split(":")
  const iv = Buffer.from(ivHex, "hex")
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "utf-8"), iv)
  let decrypted = decipher.update(encryptedText, "hex", "utf8")
  decrypted += decipher.final("utf8")
  return decrypted
}

function generateRandomText(length = 5) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid confusing ones
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}


export function createCaptchaImage() {
  const text = generateRandomText();
  const width = 150;
  const height = 50;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f2f2f2";
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(0,0,0,${Math.random()})`;
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }
  ctx.font = "28px sans-serif";
  ctx.fillStyle = "#333";
  ctx.setTransform(1, 0.1 * Math.random(), 0.1 * Math.random(), 1, 0, 0);
  ctx.fillText(text, 20, 35);
  const data = canvas.toDataURL();
  return{
    data: data,
    text: text
  }
}
