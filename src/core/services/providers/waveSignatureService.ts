import crypto from "crypto";

export function verifyWaveSignature(rawBody: string, header: string | undefined): boolean {
  if (!header) return false;

  const secret = process.env.WAVE_WEBHOOK_SECRET!;
  const parts = header.split(",");

  let timestamp = "";
  let receivedSignature = "";

  for (const p of parts) {
    const [key, value] = p.split("=");
    if (key === "t") timestamp = value;
    if (key === "s") receivedSignature = value;
  }

  if (!timestamp || !receivedSignature) return false;

  const payload = `${timestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  return expected === receivedSignature;
}
