import axios from "axios";

type WaveCreatePaymentResult = {
  id: string;
  url: string;
  // add more fields if you use them later
}; 

export async function createWavePayment(amount: number, currency: string, paymentId: number, orderId: number): Promise<WaveCreatePaymentResult> {
  const apiKey = process.env.WAVE_API_KEY!;
  const base = process.env.WAVE_API_BASE!;

  const payload = {
    amount,
    currency,
    redirect_url: process.env.WAVE_REDIRECT_URL || "https://colobane.com/payment/success",
    metadata: {
      paymentId,
      orderId
    }
  };

  const response = await axios.post(base, payload, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    }
  });

  return response.data as WaveCreatePaymentResult;
}
