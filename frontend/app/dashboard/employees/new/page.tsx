'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import EmployeeForm from '@/components/EmployeeForm';
import { useAuth } from '@/lib/auth-context';

export default function NewEmployeePage() {
  const { user } = useAuth();
  const router = useRouter();
  const canCreate = user?.role === 'Super Admin' || user?.role === 'HR Manager';

  useEffect(() => {
    if (user && !canCreate) router.replace('/dashboard');
  }, [user, canCreate, router]);

  if (!canCreate) return null;

  return (
    <>
      <Topbar title="Add employee" />
      <div className="p-8">
        <EmployeeForm mode="create" onSaved={(emp) => router.push(`/dashboard/employees/${emp._id}`)} />
      </div>
    </>
  );
}
