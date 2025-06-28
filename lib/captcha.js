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

export function generateCaptchaSVG() {
  const text = generateRandomText();
  const width = 160;
  const height = 60;
  const fontSize = 32;
  const charsSvg = text.split('').map((char, i) => {
    const x = 20 + i * 22 + Math.random() * 4;
    const y = 40 + Math.random() * 10;
    const rotate = (Math.random() - 0.5) * 30;
    const fill = `hsl(${Math.random() * 360}, 70%, 40%)`;
    return `<text x="${x}" y="${y}" fill="${fill}" font-size="${fontSize}" transform="rotate(${rotate},${x},${y})">${char}</text>`;
  }).join('');
  const noise = Array.from({ length: 5 }).map(() => {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const x2 = Math.random() * width;
    const y2 = Math.random() * height;
    const stroke = `rgba(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},0.5)`;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1" />`;
  }).join('');
  return {svg: `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#f9f9f9"/>
      <g font-family="Verdana, sans-serif">${charsSvg}</g>
      ${noise}
    </svg>
    `, text: text};
}

