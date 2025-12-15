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

  if (q.isLoading) return <div>Loading…</div>;
  if (q.isError) return <div className="text-red-600">{String(q.error)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-semibold">Holdings</h1>
        <div className="text-sm">
          Total P&amp;L (approx):{' '}
          <span className={totalLivePnl >= 0 ? 'text-green-600' : 'text-red-600'}>
            {totalLivePnl.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="overflow-auto rounded-xl border">
        <table className="min-w-[1000px] w-full text-sm">
          <thead className="bg-neutral-50">
            <tr className="text-left">
              <th className="p-3">Symbol</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Avg</th>
              <th className="p-3">LTP</th>
              <th className="p-3">Day %</th>
              <th className="p-3">Live P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((h, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-3 font-medium">{h.tradingsymbol}</td>
                <td className="p-3">{h.quantity}</td>
                <td className="p-3">{Number(h.average_price).toFixed(2)}</td>
                <td className="p-3">{Number(h._ltp).toFixed(2)}</td>
                <td className="p-3">
                  {h._dayChgPct == null ? (
                    '—'
                  ) : (
                    <span
                      className={h._dayChgPct >= 0 ? 'text-green-600' : 'text-red-600'}
                    >
                      {h._dayChgPct.toFixed(2)}%
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <span className={h._livePnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {h._livePnl.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
