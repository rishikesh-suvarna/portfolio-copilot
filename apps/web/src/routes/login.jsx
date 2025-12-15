import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { apiGet } from '../api/client';

export const Route = createFileRoute('/login')({
  component: Login,
});

function Login() {
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    try {
      const { url } = await apiGet('/api/auth/login-url');
      window.location.href = url;
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-[slideUp_0.5s_ease-out]">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent">
          Connect Your Account
        </h1>
        <p className="text-slate-600 max-w-md mx-auto">
          Securely authenticate with Kite to access your portfolio and start monitoring
          your investments in real-time.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <svg
                className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Secure OAuth Flow</p>
                <p className="text-xs text-blue-700 mt-1">
                  You'll be redirected to Kite's official login page. We never access
                  your password.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
              <div className="p-4 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-blue-600">1</span>
                </div>
                <p className="text-xs font-medium text-slate-700">Authenticate</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-indigo-600">2</span>
                </div>
                <p className="text-xs font-medium text-slate-700">Authorize</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold text-violet-600">3</span>
                </div>
                <p className="text-xs font-medium text-slate-700">Connect</p>
              </div>
            </div>
          </div>

          <button
            onClick={start}
            disabled={loading}
            className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>Continue with Kite</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </>
            )}
          </button>

          <p className="text-xs text-center text-slate-500">
            By continuing, you agree to Kite's terms of service and privacy policy
          </p>
        </div>
      </div>

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
      `}</style>
    </div>
  );
}
