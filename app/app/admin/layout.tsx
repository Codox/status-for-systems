'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthGuard from '../components/AuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="flex min-h-screen">
          <aside className="w-56 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
            <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
              Admin
            </div>
            <nav className="space-y-1">
              <Link
                href="/admin"
                className={[
                  'block px-3 py-2 rounded-md text-sm',
                  pathname === '/admin'
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
                ].join(' ')}
              >
                Dashboard
              </Link>
            </nav>
          </aside>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
