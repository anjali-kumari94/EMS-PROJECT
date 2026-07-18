'use client';

import { useAuth } from '@/lib/auth-context';

const ROLE_BADGE: Record<string, string> = {
  'Super Admin': 'bg-navy-light text-white',
  'HR Manager': 'bg-amber-light text-amber',
  Employee: 'bg-teal-light text-teal',
};

export default function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-8 py-4">
      <h1 className="font-display text-xl font-medium text-ink">{title}</h1>
      <div className="flex items-center gap-3">
        {user && (
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${ROLE_BADGE[user.role]}`}>
            {user.role}
          </span>
        )}
        <button
          onClick={logout}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-ink-soft transition hover:border-navy hover:text-navy"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
