'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const NAV = [
  { href: '/dashboard', label: 'Overview', roles: ['Super Admin', 'HR Manager', 'Employee'] },
  { href: '/dashboard/employees', label: 'Employees', roles: ['Super Admin', 'HR Manager'] },
  { href: '/dashboard/org-chart', label: 'Org chart', roles: ['Super Admin', 'HR Manager', 'Employee'] },
  { href: '/dashboard/profile', label: 'My profile', roles: ['Super Admin', 'HR Manager', 'Employee'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = NAV.filter((item) => !user || item.roles.includes(user.role));

  return (
    <aside className="flex h-screen w-60 flex-col justify-between bg-navy px-4 py-6 text-white">
      <div>
        <div className="px-2 pb-8">
          <p className="font-display text-lg font-semibold">EMS</p>
          <p className="font-mono text-[11px] text-white/50">Employee Management</p>
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  active ? 'bg-white/10 font-medium text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {user && (
        <div className="rounded-lg bg-white/5 px-3 py-3">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="font-mono text-[11px] text-white/50">{user.role}</p>
        </div>
      )}
    </aside>
  );
}
