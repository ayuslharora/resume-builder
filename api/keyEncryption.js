import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

function getSecret() {
  const hex = process.env.GROQ_KEY_ENCRYPTION_SECRET;
  if (!hex || hex.length !== 64) {
    throw new Error("GROQ_KEY_ENCRYPTION_SECRET must be a 64-char hex string");
  }
  return Buffer.from(hex, "hex");
}

export function encrypt(plaintext) {
  const key = getSecret();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decrypt(stored) {
  const key = getSecret();
  const parts = stored.split(":");
  if (parts.length !== 3) throw new Error("Invalid encrypted key format");
  const [ivHex, tagHex, encHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(encHex, "hex");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
