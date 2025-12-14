import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { apiGet } from "../api/client";
import { createWs } from "../lib/ws";

export const Route = createFileRoute("/stream")({
  component: Stream,
});

function Stream() {
  const [events, setEvents] = useState([]);
  const wsRef = useRef(null);

  const holdingsQ = useQuery({
    queryKey: ["holdings"],
    queryFn: () => apiGet("/api/portfolio/holdings"),
  });

  useEffect(() => {
    const ws = createWs("/ws/stream");
    wsRef.current = ws;

    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      setEvents((prev) => [msg, ...prev].slice(0, 50));
    };

    return () => ws.close();
  }, []);

  function subscribeFromHoldings() {
    const hs = Array.isArray(holdingsQ.data) ? holdingsQ.data : [];
    const tokens = hs.map((h) => h.instrument_token).filter((t) => typeof t === "number");

    wsRef.current?.send(
      JSON.stringify({
        type: "SUBSCRIBE",
        tokens,
        mode: "full",
      })
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Realtime Stream</h1>

      <div className="flex gap-2">
        <button
          onClick={subscribeFromHoldings}
          className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
          disabled={holdingsQ.isLoading || !wsRef.current}
        >
          Subscribe holdings
        </button>
      </div>

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
