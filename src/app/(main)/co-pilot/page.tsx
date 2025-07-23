
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function CoPilotRedirectPage() {
    const router = useRouter();
    // Redirect to the new Projects page, as Co-Pilot is now a feature within Projects.
    React.useEffect(() => {
        router.replace('/projects');
    }, [router]);

    return (
        <main className="p-4 sm:p-6 flex-1 flex items-center justify-center">
            <p>Redirecting to Projects...</p>
        </main>
    );
}
