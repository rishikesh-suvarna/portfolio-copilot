import { createFileRoute } from '@tanstack/react-router';
import { apiGet } from '../api/client';

export const Route = createFileRoute('/login')({
  component: Login,
});

function Login() {
  async function start() {
    const { url } = await apiGet('/api/auth/login-url');
    window.location.href = url;
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="text-sm text-neutral-600">
        This will redirect to Kite and come back with a request_token.
      </p>
      <button
        onClick={start}
        className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
      >
        Continue with Kite
      </button>
    </div>
  );
}
