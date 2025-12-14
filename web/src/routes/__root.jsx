import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  return (
    <div className="min-h-dvh">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-semibold">
            Portfolio Copilot
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/holdings" className="[&.active]:font-semibold">
              Holdings
            </Link>
            <Link to="/stream" className="[&.active]:font-semibold">
              Stream
            </Link>
            <Link to="/auth/kite/callback" className="[&.active]:font-semibold">
              Auth Callback
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
