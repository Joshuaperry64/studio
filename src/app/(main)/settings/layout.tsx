
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store/user-store';
import { Card, CardContent } from '@/components/ui/card';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useUserStore();

  const navItems = [
    { href: '/settings/application', label: 'Application' },
    { href: '/settings/profile', label: 'Profile' },
    ...(user?.role === 'admin' ? [{ href: '/settings/memory', label: 'Persistent Memory' }] : []),
    ...(user?.username === 'Joshua' ? [{ href: '/settings/directive', label: 'AI Directive' }] : []),
  ];

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-headline">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application settings.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-[180px_1fr]">
          <nav className="grid gap-1 text-sm text-muted-foreground">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground',
                  pathname === item.href && 'bg-accent font-medium text-accent-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="md:col-span-1">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
