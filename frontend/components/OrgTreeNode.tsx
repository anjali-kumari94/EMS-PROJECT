'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { OrgNode } from '@/lib/types';

const DEPT_COLORS: Record<string, string> = {
  Engineering: '#1B2A4E',
  Product: '#2F6F5E',
  Design: '#C9862B',
  Sales: '#B94A48',
  Marketing: '#2E4372',
  HR: '#5B6478',
  Finance: '#16213E',
  Operations: '#2F6F5E',
};

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function OrgTreeNode({ node, depth = 0 }: { node: OrgNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 1); // auto-expand the top level only
  const router = useRouter();
  const hasReports = node.directReports.length > 0;
  const color = DEPT_COLORS[node.department] || '#5B6478';

  return (
    <div className={depth > 0 ? 'ml-6 border-l border-border pl-6' : ''}>
      <div className="flex items-center gap-3 py-2">
        {hasReports ? (
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Collapse' : 'Expand'}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border text-xs text-ink-soft"
          >
            {open ? '−' : '+'}
          </button>
        ) : (
          <span className="w-5 shrink-0" />
        )}

        <button
          onClick={() => router.push(`/dashboard/employees/${node._id}`)}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition hover:bg-canvas"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {initials(node.name)}
          </span>
          <span>
            <p className="text-sm font-medium text-ink">{node.name}</p>
            <p className="text-xs text-ink-soft">
              {node.designation} · {node.department}
            </p>
          </span>
        </button>

        {hasReports && (
          <span className="ml-1 font-mono text-xs text-ink-soft">{node.directReports.length} report(s)</span>
        )}
      </div>

      {open && hasReports && (
        <div>
          {node.directReports.map((child) => (
            <OrgTreeNode key={child._id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
