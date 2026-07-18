'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/Topbar';
import OrgPulse from '@/components/OrgPulse';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { DashboardStats } from '@/lib/types';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  const canViewStats = user?.role === 'Super Admin' || user?.role === 'HR Manager';

  useEffect(() => {
    if (!canViewStats) return;
    api
      .get<{ data: DashboardStats }>('/dashboard/stats')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load dashboard stats'));
  }, [canViewStats]);

  return (
    <>
      <Topbar title="Overview" />
      <div className="p-8">
        {!canViewStats && (
          <div className="rounded-xl border border-border bg-surface p-6">
            <p className="text-sm text-ink">Welcome back, {user?.name}.</p>
            <p className="mt-1 text-sm text-ink-soft">
              Head to{' '}
              <Link href="/dashboard/profile" className="text-navy underline">
                My profile
              </Link>{' '}
              to review your details, or check the{' '}
              <Link href="/dashboard/org-chart" className="text-navy underline">
                org chart
              </Link>{' '}
              to see where you sit.
            </p>
          </div>
        )}

        {canViewStats && error && <p className="text-sm text-rose">{error}</p>}
        {canViewStats && stats && <OrgPulse stats={stats} />}
      </div>
    </>
  );
}
