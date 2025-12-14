const WS_BASE = import.meta.env.VITE_WS_URL || "ws://localhost:8000";

export function createWs(path) {
  return new WebSocket(`${WS_BASE}${path}`);
}
