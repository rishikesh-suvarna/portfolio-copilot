import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../api/client";

export const Route = createFileRoute("/auth/kite/callback")({
  component: KiteCallback,
  validateSearch: (search) => search,
});

function KiteCallback() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState("idle");
  const [resp, setResp] = useState(null);

  const requestToken = useMemo(() => search?.request_token ?? null, [search]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!requestToken) return;

      setStatus("exchanging");
      try {
        const data = await apiPost("/api/auth/exchange", { request_token: requestToken });
        if (cancelled) return;
        setResp(data);
        setStatus("done");
        setTimeout(() => navigate({ to: "/holdings" }), 300);
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setResp({ error: String(e) });
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [requestToken, navigate]);

  async function openLogin() {
    const { url } = await apiGet("/api/auth/login-url");
    window.location.href = url;
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Kite Auth Callback</h1>

      {!requestToken ? (
        <div className="space-y-2">
          <p className="text-sm text-neutral-600">
            No <code>request_token</code> found in URL. Click login.
          </p>
          <button
            onClick={openLogin}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
          >
            Login with Kite
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm">
            request_token: <code className="rounded bg-neutral-100 px-1">{requestToken}</code>
          </div>
          <div className="text-sm">status: {status}</div>
        </div>
      )}

      {resp ? (
        <pre className="rounded-xl border bg-neutral-50 p-3 text-xs overflow-auto">
          {JSON.stringify(resp, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
