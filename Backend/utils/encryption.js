import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes (64 hex characters)
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // For AES-GCM, IV length should be 12-16 bytes

export function encrypt(text) {
  if (!text) return text;
  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is not defined in .env");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "hex"), iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");
  
  // Format: iv:authTag:encryptedContent
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decrypt(hash) {
  if (!hash || typeof hash !== "string" || !hash.includes(":")) return hash;
  if (!ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is not defined in .env");
  }

  try {
    const [ivHex, authTagHex, encryptedText] = hash.split(":");
    
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "hex"), iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error.message);
    return hash; // Return original hash if decryption fails
  }
}
