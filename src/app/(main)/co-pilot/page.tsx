
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function CoPilotRedirectPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    React.useEffect(() => {
        toast({
            title: "Co-Pilot has moved!",
            description: "The AI Co-Pilot is now integrated into the Projects page. Redirecting you now...",
        });
        router.replace('/projects');
    }, [router, toast]);

    return (
        <main className="p-4 sm:p-6 flex-1 flex items-center justify-center">
            <p>Redirecting to Projects...</p>
        </main>
    );
}
