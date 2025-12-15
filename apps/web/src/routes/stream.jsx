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
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
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
        setIsConnected(true);
        if (pendingSubRef.current) {
          safeSend(sock, pendingSubRef.current);
          pendingSubRef.current = null;
          setIsSubscribed(true);
        }
      },
      onMessage: (ev) => {
        const msg = JSON.parse(ev.data);
        setEvents((prev) => [{ ...msg, timestamp: Date.now() }, ...prev].slice(0, 50));
      },
      onClose: () => {
        setIsConnected(false);
        setIsSubscribed(false);
      },
    });

    wsRef.current = ws;
    return () => {
      ws.close();
      setIsConnected(false);
    };
  }, []);

  function subscribe() {
    const payload = JSON.stringify({ type: 'SUBSCRIBE', tokens, mode: 'full' });

    if (!safeSend(wsRef.current, payload)) {
      pendingSubRef.current = payload;
    } else {
      setIsSubscribed(true);
    }
  }

  function unsubscribe() {
    const payload = JSON.stringify({ type: 'UNSUBSCRIBE', tokens });
    safeSend(wsRef.current, payload);
    setIsSubscribed(false);
    setEvents([]);
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Real-time Stream</h1>
          <p className="text-slate-600 mt-1">Live market data for your holdings</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div
            className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium ${
              isConnected
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-1">Subscription Controls</h3>
            <p className="text-sm text-slate-600">
              {tokens.length > 0
                ? `Ready to stream ${tokens.length} instrument${tokens.length !== 1 ? 's' : ''}`
                : 'Load your holdings first to subscribe to market data'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isSubscribed ? (
              <button
                onClick={subscribe}
                disabled={!tokens.length || !isConnected}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-lg flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Subscribe to Stream
              </button>
            ) : (
              <button
                onClick={unsubscribe}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold border border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-all flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
                Unsubscribe
              </button>
            )}
          </div>
        </div>

        {isSubscribed && events.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                <p className="text-2xl font-bold text-blue-600">{events.length}</p>
                <p className="text-xs text-blue-700 font-medium mt-1">Total Events</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                <p className="text-2xl font-bold text-indigo-600">
                  {events[0]
                    ? new Date(events[0].timestamp).toLocaleTimeString()
                    : '--'}
                </p>
                <p className="text-xs text-indigo-700 font-medium mt-1">Last Update</p>
              </div>
              <div className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                <p className="text-2xl font-bold text-violet-600">{tokens.length}</p>
                <p className="text-xs text-violet-700 font-medium mt-1">
                  Active Streams
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Live Event Feed</h3>
          {events.length > 0 && (
            <button
              onClick={() => setEvents([])}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Clear
            </button>
          )}
        </div>

        <div className="overflow-auto h-[60vh] p-4 space-y-2">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-700">No events yet</p>
                <p className="text-sm text-slate-500 mt-1">
                  {isSubscribed
                    ? 'Waiting for market data...'
                    : 'Subscribe to start receiving real-time updates'}
                </p>
              </div>
            </div>
          ) : (
            events.map((e, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all animate-[slideDown_0.3s_ease-out]"
                style={{ animationDelay: `${i * 0.02}s` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-700">
                        Event #{events.length - i}
                      </span>
                      {e.timestamp && (
                        <p className="text-xs text-slate-500">
                          {new Date(e.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-blue-100 text-xs font-mono text-blue-700">
                    {e.type || 'tick'}
                  </span>
                </div>
                <pre className="text-xs font-mono text-slate-700 overflow-auto bg-white rounded-lg p-3 border border-slate-200">
                  {JSON.stringify(e, null, 2)}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
