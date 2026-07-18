import type { DashboardStats } from '@/lib/types';

const DEPT_COLORS = ['#1B2A4E', '#2F6F5E', '#C9862B', '#B94A48', '#2E4372', '#5B6478'];

export default function OrgPulse({ stats }: { stats: DashboardStats }) {
  const activePct = stats.totalEmployees ? (stats.activeEmployees / stats.totalEmployees) * 100 : 0;
  const inactivePct = 100 - activePct;

  const metrics = [
    { label: 'Total employees', value: stats.totalEmployees },
    { label: 'Active', value: stats.activeEmployees },
    { label: 'Inactive', value: stats.inactiveEmployees },
    { label: 'Departments', value: stats.departmentCount },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label}>
            <p className="font-mono text-3xl font-medium text-ink">{m.value}</p>
            <p className="mt-1 text-xs text-ink-soft">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Active vs Inactive as one proportion bar, rather than two disconnected cards */}
      <div className="mt-6">
        <div className="flex h-3 w-full overflow-hidden rounded-full bg-border">
          <div className="h-full bg-teal transition-all" style={{ width: `${activePct}%` }} title={`Active ${stats.activeEmployees}`} />
          <div className="h-full bg-rose transition-all" style={{ width: `${inactivePct}%` }} title={`Inactive ${stats.inactiveEmployees}`} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink-soft">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal" /> Active ({activePct.toFixed(0)}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose" /> Inactive ({inactivePct.toFixed(0)}%)
          </span>
        </div>
      </div>

      {/* Department composition */}
      {stats.byDepartment.length > 0 && (
        <div className="mt-6 border-t border-border pt-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-soft">By department</p>
          <div className="space-y-2">
            {stats.byDepartment.map((d, i) => {
              const pct = stats.totalEmployees ? (d.count / stats.totalEmployees) * 100 : 0;
              return (
                <div key={d.department} className="flex items-center gap-3">
                  <span className="w-28 truncate text-xs text-ink-soft">{d.department}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: DEPT_COLORS[i % DEPT_COLORS.length] }}
                    />
                  </div>
                  <span className="w-6 text-right font-mono text-xs text-ink-soft">{d.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
