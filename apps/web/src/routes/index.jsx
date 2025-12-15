import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-slate-600 text-lg">Your portfolio management hub</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/login" className="group">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">1. Login</h3>
            <p className="text-sm text-slate-600">
              Connect your Kite account to get started
            </p>
          </div>
        </Link>

        <Link to="/holdings" className="group">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              2. View Holdings
            </h3>
            <p className="text-sm text-slate-600">
              Review your portfolio positions and P&L
            </p>
          </div>
        </Link>

        <Link to="/stream" className="group">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              3. Live Stream
            </h3>
            <p className="text-sm text-slate-600">
              Subscribe to real-time market ticks
            </p>
          </div>
        </Link>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">
              Getting Started
            </h4>
            <p className="text-sm text-blue-700">
              Follow the steps above to authenticate with Kite, fetch your holdings, and
              start monitoring real-time market data for your portfolio.
            </p>
          </div>
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
      `}</style>
    </div>
  );
}
