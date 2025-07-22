'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
    const { user } = useAuth();
    const router = useRouter();

    React.useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/chat');
        }
    }, [user, router]);
    
    if (!user || user.role !== 'admin') {
        return (
            <main className="p-4 sm:p-6 flex-1">
                <div className="max-w-3xl mx-auto text-center">
                    <p>Access Denied. Redirecting...</p>
                </div>
            </main>
        );
    }

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>Welcome, Administrator. This is your control panel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Here you can manage users, view system analytics, and configure application settings.</p>
            <p className="text-sm text-muted-foreground">
                Note: This is a placeholder for future admin functionality.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
