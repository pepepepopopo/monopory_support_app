import { createConsumer, type Consumer } from "@rails/actioncable";

const API_WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000/cable";

export function getGameConsumer(token: string): Consumer {
  return createConsumer(`${API_WS_URL}?token=${token}`);
}
