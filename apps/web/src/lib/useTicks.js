import { useEffect, useMemo, useRef, useState } from 'react';
import { createWs } from './ws';

export function useTicks({ tokens = [], mode = 'full', auto = true } = {}) {
  const wsRef = useRef(null);
  const [byToken, setByToken] = useState({}); // { [instrument_token]: tick }

  const tokensKey = useMemo(
    () =>
      tokens
        .slice()
        .sort((a, b) => a - b)
        .join(','),
    [tokens]
  );

  useEffect(() => {
    if (!auto) return;

    const ws = createWs('/ws/stream', {
      onOpen: (sock) => {
        wsRef.current = sock;
        if (tokens.length) {
          sock.send(JSON.stringify({ type: 'SUBSCRIBE', tokens, mode }));
        }
      },
      onMessage: (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg?.type !== 'TICKS' || !Array.isArray(msg.data)) return;

        setByToken((prev) => {
          const next = { ...prev };
          for (const t of msg.data) next[t.instrument_token] = t;
          return next;
        });
      },
    });

    wsRef.current = ws;
    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokensKey, mode, auto]);

  return { byToken };
}
