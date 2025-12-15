import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { apiGet } from '../api/client';
import { useTicks } from '../lib/useTicks';

export const Route = createFileRoute('/holdings')({
  component: Holdings,
});

function Holdings() {
  const q = useQuery({
    queryKey: ['holdings'],
    queryFn: () => apiGet('/api/portfolio/holdings'),
  });

  const holdings = Array.isArray(q.data) ? q.data : [];
  const tokens = holdings
    .map((h) => h.instrument_token)
    .filter((t) => typeof t === 'number');

  const { byToken } = useTicks({ tokens, mode: 'full', auto: tokens.length > 0 });

  const rows = holdings.map((h) => {
    const tick = byToken[h.instrument_token];
    const ltp = typeof tick?.last_price === 'number' ? tick.last_price : h.last_price;

    const qty = Number(h.quantity ?? 0);
    const avg = Number(h.average_price ?? 0);

    // Approx live P&L using avg_price and current LTP
    const livePnl = (ltp - avg) * qty;

    // Day change % based on previous close from tick.ohlc.close
    const prevClose = Number(tick?.ohlc?.close ?? 0);
    const dayChgPct = prevClose > 0 ? ((ltp - prevClose) / prevClose) * 100 : null;

    return {
      ...h,
      _ltp: ltp,
      _livePnl: livePnl,
      _dayChgPct: dayChgPct,
    };
  });

  const totalLivePnl = rows.reduce((sum, r) => sum + (Number(r._livePnl) || 0), 0);
  const totalValue = rows.reduce(
    (sum, r) => sum + (Number(r._ltp) * Number(r.quantity) || 0),
    0
  );
  const positiveCount = rows.filter((r) => (r._livePnl || 0) > 0).length;
  const negativeCount = rows.filter((r) => (r._livePnl || 0) < 0).length;

  if (q.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-slate-600 font-medium">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-red-900">Error Loading Holdings</p>
            <p className="text-sm text-red-700 mt-1">{String(q.error)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Holdings</h1>
          <p className="text-slate-600 mt-1">Your portfolio at a glance</p>
        </div>
        <button
          onClick={() => q.refetch()}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow flex items-center gap-2"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">₹{totalValue.toFixed(2)}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Live P&L
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                totalLivePnl >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <svg
                className={`w-4 h-4 ${totalLivePnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    totalLivePnl >= 0
                      ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                      : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
                  }
                />
              </svg>
            </div>
          </div>
          <p
            className={`text-2xl font-bold ${totalLivePnl >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {totalLivePnl >= 0 ? '+' : ''}₹{totalLivePnl.toFixed(2)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Holdings
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{rows.length}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Win Rate
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-violet-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {rows.length > 0 ? ((positiveCount / rows.length) * 100).toFixed(0) : 0}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {positiveCount}W / {negativeCount}L
          </p>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[1000px] w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="text-right p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="text-right p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Avg Price
                </th>
                <th className="text-right p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  LTP
                </th>
                <th className="text-right p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Day %
                </th>
                <th className="text-right p-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Live P&L
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No holdings found
                  </td>
                </tr>
              ) : (
                rows.map((h, idx) => {
                  const currentValue = (h._ltp || 0) * (h.quantity || 0);
                  const pnl = h._livePnl || 0;
                  const pnlPercent =
                    h.average_price > 0
                      ? (pnl / (h.average_price * h.quantity)) * 100
                      : 0;

                  return (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-white font-bold text-sm">
                              {h.tradingsymbol?.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {h.tradingsymbol}
                            </p>
                            <p className="text-xs text-slate-500">
                              {h.exchange || 'NSE'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-medium text-slate-900">
                        {h.quantity}
                      </td>
                      <td className="p-4 text-right text-slate-700">
                        ₹{(h.average_price || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-right font-medium text-slate-900">
                        ₹{(h._ltp || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        {h._dayChgPct == null ? (
                          <span className="text-slate-500">—</span>
                        ) : (
                          <span
                            className={
                              h._dayChgPct >= 0
                                ? 'text-green-600 font-medium'
                                : 'text-red-600 font-medium'
                            }
                          >
                            {h._dayChgPct >= 0 ? '+' : ''}
                            {h._dayChgPct.toFixed(2)}%
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div
                            className={`px-3 py-1.5 rounded-lg font-semibold ${
                              pnl >= 0
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              {pnl >= 0 ? (
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                              <span className="text-sm">
                                {pnl >= 0 ? '+' : ''}₹{pnl.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              pnl >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            ({pnl >= 0 ? '+' : ''}
                            {pnlPercent.toFixed(2)}%)
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
