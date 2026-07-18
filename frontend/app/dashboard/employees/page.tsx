'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Employee, PaginatedEmployees } from '@/lib/types';

const STATUS_STYLE: Record<string, string> = {
  Active: 'bg-teal-light text-teal',
  Inactive: 'bg-rose-light text-rose',
};

export default function EmployeesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('joiningDate');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const canManage = user?.role === 'Super Admin' || user?.role === 'HR Manager';

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({
      page: String(page),
      limit: '10',
      sortBy,
      order,
      ...(search && { search }),
      ...(department && { department }),
      ...(status && { status }),
    });
    try {
      const res = await api.get<PaginatedEmployees>(`/employees?${params.toString()}`);
      setEmployees(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load employees');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, order, search, department, status]);

  useEffect(() => {
    if (!canManage) return;
    fetchEmployees();
  }, [fetchEmployees, canManage]);

  if (!canManage) {
    return (
      <>
        <Topbar title="Employees" />
        <div className="p-8">
          <p className="text-sm text-ink-soft">You don&apos;t have access to the full employee directory.</p>
        </div>
      </>
    );
  }

  const departments = Array.from(new Set(employees.map((e) => e.department)));

  return (
    <>
      <Topbar title="Employees" />
      <div className="p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search name or email…"
              className="w-56 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            />
            <select
              value={department}
              onChange={(e) => {
                setPage(1);
                setDepartment(e.target.value);
              }}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            >
              <option value="">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select
              value={`${sortBy}:${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split(':');
                setSortBy(sb);
                setOrder(ord as 'asc' | 'desc');
              }}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-navy"
            >
              <option value="joiningDate:desc">Newest joined</option>
              <option value="joiningDate:asc">Oldest joined</option>
              <option value="name:asc">Name A–Z</option>
              <option value="name:desc">Name Z–A</option>
            </select>
          </div>

          <Link
            href="/dashboard/employees/new"
            className="rounded-lg bg-navy px-4 py-2 text-sm font-medium text-white transition hover:bg-navy-light"
          >
            + Add employee
          </Link>
        </div>

        {error && <p className="mb-3 text-sm text-rose">{error}</p>}

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Designation</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-ink-soft">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-ink-soft">
                    No employees match these filters.
                  </td>
                </tr>
              )}
              {!loading &&
                employees.map((emp) => (
                  <tr
                    key={emp._id}
                    onClick={() => router.push(`/dashboard/employees/${emp._id}`)}
                    className="cursor-pointer hover:bg-canvas"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft">{emp.employeeId}</td>
                    <td className="px-4 py-3 font-medium text-ink">{emp.name}</td>
                    <td className="px-4 py-3 text-ink-soft">{emp.department}</td>
                    <td className="px-4 py-3 text-ink-soft">{emp.designation}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[emp.status]}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink-soft">
                      {new Date(emp.joiningDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-ink-soft">
          <span>{total} total</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="font-mono text-xs">
              {page} / {totalPages || 1}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
