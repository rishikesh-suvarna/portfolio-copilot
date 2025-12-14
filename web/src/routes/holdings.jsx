import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { apiGet } from "../api/client";

export const Route = createFileRoute("/holdings")({
  component: Holdings,
});

function Holdings() {
  const q = useQuery({
    queryKey: ["holdings"],
    queryFn: () => apiGet("/api/portfolio/holdings"),
  });

  if (q.isLoading) return <div>Loading…</div>;
  if (q.isError) return <div className="text-red-600">{String(q.error)}</div>;

  const items = Array.isArray(q.data) ? q.data : [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Holdings</h1>

      <div className="overflow-auto rounded-xl border">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-neutral-50">
            <tr className="text-left">
              <th className="p-3">Symbol</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Avg</th>
              <th className="p-3">LTP</th>
              <th className="p-3">P&amp;L</th>
            </tr>
          </thead>
          <tbody>
            {items.map((h, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-3 font-medium">{h.tradingsymbol}</td>
                <td className="p-3">{h.quantity}</td>
                <td className="p-3">{h.average_price}</td>
                <td className="p-3">{h.last_price}</td>
                <td className="p-3">{h.pnl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <pre className="rounded-xl border bg-neutral-50 p-3 text-xs overflow-auto">
        {JSON.stringify(q.data, null, 2)}
      </pre>
    </div>
  );
}
