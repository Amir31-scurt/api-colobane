import crypto from "crypto";

export function verifyOrangeMoneySignature(rawBody: string, signature: string | undefined): boolean {
    if (!signature) return false;
  
    const secret = process.env.OM_WEBHOOK_SECRET!;
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  
    return expected === signature;
  }
  