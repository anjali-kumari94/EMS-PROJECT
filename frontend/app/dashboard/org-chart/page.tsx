'use client';

import { useEffect, useState } from 'react';
import Topbar from '@/components/Topbar';
import OrgTreeNode from '@/components/OrgTreeNode';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { OrgNode } from '@/lib/types';

export default function OrgChartPage() {
  const { user } = useAuth();
  const [tree, setTree] = useState<OrgNode[]>([]);
  const [error, setError] = useState('');
  const canViewFullTree = user?.role === 'Super Admin' || user?.role === 'HR Manager';

  useEffect(() => {
    if (!canViewFullTree) return;
    api
      .get<{ data: OrgNode[] }>('/organization/tree')
      .then((res) => setTree(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the org chart'));
  }, [canViewFullTree]);

  return (
    <>
      <Topbar title="Org chart" />
      <div className="p-8">
        {!canViewFullTree && (
          <p className="text-sm text-ink-soft">
            Ask your manager or HR for a view of the wider org chart — from here you can see your own
            reporting line on your profile page.
          </p>
        )}
        {canViewFullTree && error && <p className="text-sm text-rose">{error}</p>}
        {canViewFullTree && tree.length === 0 && !error && <p className="text-sm text-ink-soft">No employees yet.</p>}
        {canViewFullTree && tree.length > 0 && (
          <div className="rounded-xl border border-border bg-surface p-6">
            {tree.map((root) => (
              <OrgTreeNode key={root._id} node={root} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
