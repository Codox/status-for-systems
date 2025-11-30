'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AuthGuard from '../components/AuthGuard';
import { removeAuthToken } from '@/lib/utils/auth.utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';

  const handleLogout = () => {
    removeAuthToken();
    router.push('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="flex min-h-screen">
          <aside className="w-56 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex flex-col h-screen sticky top-0">
            <div className="flex-shrink-0">
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
                <Link
                  href="/admin/incidents"
                  className={[
                    'block px-3 py-2 rounded-md text-sm',
                    pathname?.startsWith('/admin/incidents')
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
                  ].join(' ')}
                >
                  Incidents
                </Link>
                <Link
                  href="/admin/components"
                  className={[
                    'block px-3 py-2 rounded-md text-sm',
                    pathname === '/admin/components'
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                      : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
                  ].join(' ')}
                >
                  Components
                </Link>
              </nav>
            </div>

            <div className="mt-auto flex-shrink-0 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Public Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log Out
              </button>
            </div>
          </aside>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
