import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { apiGet } from '../api/client';
import { createWs, safeSend } from '../lib/ws';

export const Route = createFileRoute('/stream')({
  component: Stream,
});

function Stream() {
  const [events, setEvents] = useState([]);
  const wsRef = useRef(null);
  const pendingSubRef = useRef(null);

  const holdingsQ = useQuery({
    queryKey: ['holdings'],
    queryFn: () => apiGet('/api/portfolio/holdings'),
  });

  const tokens = useMemo(() => {
    const hs = Array.isArray(holdingsQ.data) ? holdingsQ.data : [];
    return hs.map((h) => h.instrument_token).filter((t) => typeof t === 'number');
  }, [holdingsQ.data]);

  useEffect(() => {
    const ws = createWs('/ws/stream', {
      onOpen: (sock) => {
        wsRef.current = sock;
        if (pendingSubRef.current) {
          safeSend(sock, pendingSubRef.current);
          pendingSubRef.current = null;
        }
      },
      onMessage: (ev) => {
        const msg = JSON.parse(ev.data);
        setEvents((prev) => [msg, ...prev].slice(0, 50));
      },
    });

    wsRef.current = ws;
    return () => ws.close();
  }, []);

  function subscribe() {
    const payload = JSON.stringify({ type: 'SUBSCRIBE', tokens, mode: 'full' });

    if (!safeSend(wsRef.current, payload)) {
      pendingSubRef.current = payload; // will send on open
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Realtime Stream</h1>

      <button
        onClick={subscribe}
        className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
        disabled={!tokens.length}
      >
        Subscribe holdings
      </button>

      <div className="rounded-xl border bg-neutral-50 p-3 text-xs overflow-auto h-[60vh]">
        {events.map((e, i) => (
          <pre key={i} className="border-b py-2 last:border-b-0">
            {JSON.stringify(e, null, 2)}
          </pre>
        ))}
      </div>
    </div>
  );
}
