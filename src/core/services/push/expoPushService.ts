import axios from "axios";
import { prisma } from "../../../infrastructure/prisma/prismaClient";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface PushPayload {
  userId: number;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export async function sendExpoPushToUser(userId: number, title: string, body: string, data?: Record<string, any>) {
  const tokens = await prisma.pushToken.findMany({
    where: { userId, isActive: true }
  });

  if (tokens.length === 0) return;

  const messages = tokens.map((t: any) => ({
    to: t.token,
    sound: "default",
    title,
    body,
    data: data ?? {}
  }));

  await axios.post(EXPO_PUSH_URL, messages, {
    headers: { "Content-Type": "application/json" }
  });
}

export async function sendExpoPush(payload: PushPayload) {
  const tokens = await prisma.pushToken.findMany({
    where: {
      userId: payload.userId,
      isActive: true
    }
  });

  if (tokens.length === 0) return;

  const messages = tokens.map((t: any) => ({
    to: t.token,
    sound: "default",
    title: payload.title,
    body: payload.body,
    data: payload.data ?? {}
  }));

  try {
    await axios.post(EXPO_PUSH_URL, messages, {
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (err) {
    console.error("EXPO_PUSH_ERROR:", err);
  }
}
