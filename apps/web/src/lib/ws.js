const WS_BASE = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export function createWs(path, { onOpen, onMessage, onClose, onError } = {}) {
  const ws = new WebSocket(`${WS_BASE}${path}`);

  ws.onopen = () => onOpen?.(ws);
  ws.onmessage = (ev) => onMessage?.(ev, ws);
  ws.onclose = (ev) => onClose?.(ev, ws);
  ws.onerror = (ev) => onError?.(ev, ws);

  return ws;
}

export function safeSend(ws, payload) {
  if (!ws) return false;
  if (ws.readyState !== WebSocket.OPEN) return false;
  ws.send(payload);
  return true;
}
