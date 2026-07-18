'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import EmployeeForm from '@/components/EmployeeForm';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Employee } from '@/lib/types';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [reportees, setReportees] = useState<Employee[]>([]);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  const canDelete = user?.role === 'Super Admin' && user._id !== id;
  const canView =
    user?.role === 'Super Admin' || user?.role === 'HR Manager' || user?._id === id;

  useEffect(() => {
    if (!canView) return;
    api
      .get<{ data: Employee }>(`/employees/${id}`)
      .then((res) => setEmployee(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load employee'));

    api
      .get<{ data: Employee[] }>(`/employees/${id}/reportees`)
      .then((res) => setReportees(res.data))
      .catch(() => {});
  }, [id, canView]);

  const handleDelete = async () => {
    if (!confirm('Delete this employee? Their direct reports will move up to the next manager.')) return;
    setDeleting(true);
    try {
      await api.delete(`/employees/${id}`);
      router.push('/dashboard/employees');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete employee');
      setDeleting(false);
    }
  };

  if (!canView) {
    return (
      <>
        <Topbar title="Employee" />
        <div className="p-8 text-sm text-ink-soft">You don&apos;t have access to this profile.</div>
      </>
    );
  }

  return (
    <>
      <Topbar title={employee?.name || 'Employee'} />
      <div className="grid grid-cols-1 gap-8 p-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {error && <p className="mb-4 rounded-lg bg-rose-light px-3 py-2 text-sm text-rose">{error}</p>}
          {employee && (
            <EmployeeForm
              mode="edit"
              employeeId={id}
              initial={employee}
              onSaved={(emp) => setEmployee(emp)}
            />
          )}

          {canDelete && (
            <div className="mt-8 border-t border-border pt-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-rose">Danger zone</p>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-rose px-4 py-2 text-sm font-medium text-rose transition hover:bg-rose-light disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Delete employee'}
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-soft">
              Direct reports ({reportees.length})
            </p>
            {reportees.length === 0 && <p className="text-sm text-ink-soft">No one reports to this person yet.</p>}
            <ul className="space-y-2">
              {reportees.map((r) => (
                <li key={r._id}>
                  <button
                    onClick={() => router.push(`/dashboard/employees/${r._id}`)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm transition hover:border-navy"
                  >
                    <p className="font-medium text-ink">{r.name}</p>
                    <p className="text-xs text-ink-soft">{r.designation}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
