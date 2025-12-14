import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { apiGet, apiPost } from '../api/client';

export const Route = createFileRoute('/auth/kite/callback')({
  component: KiteCallback,
  validateSearch: (search) => search,
});

function KiteCallback() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle');
  const [resp, setResp] = useState(null);

  const didRunRef = useRef(false);

  const requestToken = useMemo(() => search?.request_token ?? null, [search]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!requestToken) return;

      // Guard for React StrictMode double-effect in dev
      if (didRunRef.current) return;
      didRunRef.current = true;

      // Prevent refresh from reusing request_token
      window.history.replaceState({}, '', '/auth/kite/callback');

      setStatus('exchanging');
      try {
        const data = await apiPost('/api/auth/exchange', {
          request_token: requestToken,
        });
        if (cancelled) return;
        setResp(data);
        setStatus('done');
        navigate({ to: '/holdings' });
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setResp({ error: String(e) });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [requestToken, navigate]);

  async function openLogin() {
    const { url } = await apiGet('/api/auth/login-url');
    window.location.href = url;
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Kite Auth Callback</h1>

      {!requestToken ? (
        <div className="space-y-2">
          <button
            onClick={openLogin}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
          >
            Login with Kite
          </button>
        </div>
      ) : (
        <div className="text-sm">status: {status}</div>
      )}

      {resp ? (
        <pre className="rounded-xl border bg-neutral-50 p-3 text-xs overflow-auto">
          {JSON.stringify(resp, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
