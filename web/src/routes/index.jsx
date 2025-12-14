import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-neutral-600">
        Next: login → fetch holdings → subscribe to ticks.
      </p>
    </div>
  );
}
