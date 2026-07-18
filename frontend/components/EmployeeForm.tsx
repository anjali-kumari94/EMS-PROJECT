'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Employee } from '@/lib/types';

interface Props {
  mode: 'create' | 'edit';
  initial?: Partial<Employee>;
  employeeId?: string; // required for edit
  onSaved: (employee: Employee) => void;
}

const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];

export default function EmployeeForm({ mode, initial, employeeId, onSaved }: Props) {
  const { user } = useAuth();
  const isSelfEditingOwnProfile = mode === 'edit' && user?.role === 'Employee' && user._id === employeeId;
  const isHR = user?.role === 'HR Manager';

  const [managers, setManagers] = useState<Employee[]>([]);
  const [form, setForm] = useState({
    name: initial?.name || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    password: '',
    department: initial?.department || DEPARTMENTS[0],
    designation: initial?.designation || '',
    salary: initial?.salary?.toString() || '',
    joiningDate: initial?.joiningDate ? initial.joiningDate.slice(0, 10) : '',
    status: initial?.status || 'Active',
    role: initial?.role || 'Employee',
    reportingManager:
      typeof initial?.reportingManager === 'object' && initial?.reportingManager
        ? initial.reportingManager._id
        : (initial?.reportingManager as string) || '',
    profileImage: initial?.profileImage || '',
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isSelfEditingOwnProfile) return; // no need for the manager list on the limited self-edit view
    api
      .get<{ data: Employee[] }>('/employees?limit=100')
      .then((res) => setManagers(res.data.filter((e) => e._id !== employeeId)))
      .catch(() => {});
  }, [isSelfEditingOwnProfile, employeeId]);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      let payload: Record<string, unknown>;

      if (isSelfEditingOwnProfile) {
        // Employees may only touch these two fields — matches backend enforcement
        payload = { phone: form.phone, profileImage: form.profileImage };
      } else {
        payload = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          department: form.department,
          designation: form.designation,
          salary: Number(form.salary),
          joiningDate: form.joiningDate,
          status: form.status,
          role: form.role,
          reportingManager: form.reportingManager || null,
          ...(mode === 'create' && { password: form.password }),
        };
      }

      const res =
        mode === 'create'
          ? await api.post<{ data: Employee }>('/employees', payload)
          : await api.put<{ data: Employee }>(`/employees/${employeeId}`, payload);

      onSaved(res.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.errors) {
          const fe: Record<string, string> = {};
          err.errors.forEach((e) => (fe[e.field] = e.message));
          setFieldErrors(fe);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-navy disabled:bg-canvas disabled:text-ink-soft';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5" noValidate>
      {error && <p className="rounded-lg bg-rose-light px-3 py-2 text-sm text-rose">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-ink">Name</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            disabled={isSelfEditingOwnProfile}
            required
          />
          {fieldErrors.name && <p className="mt-1 text-xs text-rose">{fieldErrors.name}</p>}
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-ink">Email</label>
          <input
            type="email"
            className={inputClass}
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            disabled={isSelfEditingOwnProfile || mode === 'edit'}
            required
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-rose">{fieldErrors.email}</p>}
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-ink">Phone</label>
          <input
            className={inputClass}
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="10-digit number"
            required
          />
          {fieldErrors.phone && <p className="mt-1 text-xs text-rose">{fieldErrors.phone}</p>}
        </div>

        {mode === 'create' && (
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-ink">Temporary password</label>
            <input
              type="password"
              className={inputClass}
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
              minLength={8}
            />
            {fieldErrors.password && <p className="mt-1 text-xs text-rose">{fieldErrors.password}</p>}
          </div>
        )}

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-ink">Department</label>
          <select
            className={inputClass}
            value={form.department}
            onChange={(e) => update('department', e.target.value)}
            disabled={isSelfEditingOwnProfile}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-ink">Designation</label>
          <input
            className={inputClass}
            value={form.designation}
            onChange={(e) => update('designation', e.target.value)}
            disabled={isSelfEditingOwnProfile}
            required
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-ink">Salary (₹ / year)</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={form.salary}
            onChange={(e) => update('salary', e.target.value)}
            disabled={isSelfEditingOwnProfile}
            required
          />
          {fieldErrors.salary && <p className="mt-1 text-xs text-rose">{fieldErrors.salary}</p>}
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-ink">Joining date</label>
          <input
            type="date"
            className={inputClass}
            value={form.joiningDate}
            onChange={(e) => update('joiningDate', e.target.value)}
            disabled={isSelfEditingOwnProfile}
            required
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-ink">Status</label>
          <select
            className={inputClass}
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
            disabled={isSelfEditingOwnProfile}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-ink">Role</label>
          <select
            className={inputClass}
            value={form.role}
            onChange={(e) => update('role', e.target.value)}
            disabled={isSelfEditingOwnProfile}
          >
            <option value="Employee">Employee</option>
            <option value="HR Manager">HR Manager</option>
            {/* HR Manager is never permitted to grant Super Admin — mirrors backend rule */}
            {!isHR && <option value="Super Admin">Super Admin</option>}
          </select>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="block text-sm font-medium text-ink">Reporting manager</label>
          <select
            className={inputClass}
            value={form.reportingManager}
            onChange={(e) => update('reportingManager', e.target.value)}
            disabled={isSelfEditingOwnProfile}
          >
            <option value="">None</option>
            {managers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} — {m.designation}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-navy px-5 py-2.5 text-sm font-medium text-white transition hover:bg-navy-light disabled:opacity-60"
      >
        {submitting ? 'Saving…' : mode === 'create' ? 'Create employee' : 'Save changes'}
      </button>
    </form>
  );
}
