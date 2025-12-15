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

        // Navigate after a brief delay to show success
        setTimeout(() => {
          navigate({ to: '/holdings' });
        }, 800);
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
    <div className="max-w-2xl mx-auto space-y-6 animate-[slideUp_0.5s_ease-out]">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent">
          Authentication
        </h1>
      </div>

      {!requestToken ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-900">No Authentication Token</p>
            <p className="text-sm text-slate-600 mt-1">
              Please start the login process
            </p>
          </div>
          <button
            onClick={openLogin}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Login with Kite
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8">
          {status === 'exchanging' && (
            <div className="text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-semibold text-slate-900">Verifying credentials...</p>
                <p className="text-sm text-slate-600 mt-1">
                  Please wait while we securely exchange your token
                </p>
              </div>
            </div>
          )}

          {status === 'done' && (
            <div className="text-center space-y-4 animate-[scaleIn_0.3s_ease-out]">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-lg">
                  Authentication Successful!
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  Redirecting to your holdings...
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto">
                <svg
                  className="w-10 h-10 text-red-600"
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
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-lg">
                  Authentication Failed
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  There was an error processing your request
                </p>
              </div>
              <button
                onClick={openLogin}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {resp && (
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Response Data
            </span>
            <div
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                status === 'done'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {status}
            </div>
          </div>
          <pre className="text-xs text-slate-300 overflow-auto font-mono">
            {JSON.stringify(resp, null, 2)}
          </pre>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
