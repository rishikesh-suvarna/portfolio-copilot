import { createRootRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="group flex items-center gap-3">
            <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Portfolio Copilot
            </span>
          </Link>

          <nav className="flex gap-1">
            <Link
              to="/holdings"
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all [&.active]:bg-gradient-to-br [&.active]:from-blue-50 [&.active]:to-indigo-50 [&.active]:text-blue-700 [&.active]:shadow-sm"
            >
              Holdings
            </Link>
            <Link
              to="/stream"
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all [&.active]:bg-gradient-to-br [&.active]:from-blue-50 [&.active]:to-indigo-50 [&.active]:text-blue-700 [&.active]:shadow-sm"
            >
              Stream
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all [&.active]:bg-gradient-to-br [&.active]:from-blue-50 [&.active]:to-indigo-50 [&.active]:text-blue-700 [&.active]:shadow-sm"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
