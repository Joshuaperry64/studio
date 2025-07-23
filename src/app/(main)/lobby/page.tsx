'use client';

import React, { useEffect, useState } from 'react';
import { createSession } from '@/ai/flows/create-session';
import { addParticipantToSession } from '@/ai/flows/add-participant-to-session';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/ai/genkit';

interface Session {
  id: string;
  name: string;
  createdAt: any; 
}

export default function LobbyPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [fetchingSessionsError, setFetchingSessionsError] = useState<string | null>(null);
  const [newSessionName, setNewSessionName] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);
  const [creatingSessionError, setCreatingSessionError] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUserStore(); 

  useEffect(() => {
    const sessionsCollectionRef = collection(db, 'sessions');
    const q = query(sessionsCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const sessionsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Session[];
        setSessions(sessionsData);
        setLoadingSessions(false);
    }, (error) => {
        console.error("Error fetching sessions in real-time:", error);
        setFetchingSessionsError('Failed to fetch sessions.');
        setLoadingSessions(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleCreateSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newSessionName.trim()) {
      toast({ title: 'Error', description: 'Session name cannot be empty.', variant: 'destructive' });
      return;
    }

    if (!user) {
        toast({ title: 'Error', description: 'You must be logged in to create a session.', variant: 'destructive' });
        return;
    }

    setCreatingSession(true);
    setCreatingSessionError(null);

    try {
      const result = await createSession({ sessionName: newSessionName });
      
      toast({ title: 'Session Created', description: `Session "${newSessionName}" created successfully.` });
      setNewSessionName('');

    } catch (err) {
      setCreatingSessionError('Failed to create session.');
      toast({ title: 'Error', description: 'Failed to create session.', variant: 'destructive' });
    } finally {
      setCreatingSession(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
      if (!user || !user.userId || !user.username) {
          toast({ title: 'Error', description: 'User information not available.', variant: 'destructive' });
          return;
      }

      try {
          const result = await addParticipantToSession({ sessionId, userId: user.userId, username: user.username });

          if (result.success) {
              toast({ title: 'Joined Session', description: result.message });
              router.push(`/chat/${sessionId}`); 
          } else {
              toast({ title: 'Joining Failed', description: result.message, variant: 'destructive' });
          }
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to join session.';
          toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      }
  };


  if (loadingSessions) {
    return (
      <main className="p-4 sm:p-6 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-headline mb-4">Collaborative Sessions Lobby</h1>
          <p>Loading sessions...</p>
        </div>
      </main>
    );
  }

  if (fetchingSessionsError) {
    return (
      <main className="p-4 sm:p-6 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-headline mb-4">Collaborative Sessions Lobby</h1>
          <p className="text-red-500">Error: {fetchingSessionsError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-headline mb-4">Collaborative Sessions Lobby</h1>

        <div className="mb-6 p-4 border rounded-md">
            <h2 className="text-xl font-semibold mb-2">Create New Session</h2>
            <form onSubmit={handleCreateSession} className="flex gap-2">
                <Input
                    type="text"
                    placeholder="Enter session name"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    disabled={creatingSession}
                />
                <Button type="submit" disabled={creatingSession || !newSessionName.trim()}>
                    {creatingSession ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Create Session
                </Button>
            </form>
            {creatingSessionError && <p className="text-red-500 mt-2">Error: {creatingSessionError}</p>}
        </div>

        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Available Sessions</h2>
          {sessions.length === 0 ? (
            <p>No active sessions found. Why not create one?</p>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="border p-4 rounded-md flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">{session.name}</h2>
                    <p className="text-sm text-muted-foreground">
                        Created At: {session.createdAt?.seconds ? new Date(session.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                    </p>
                </div>
                <Button onClick={() => handleJoinSession(session.id)}>Join</Button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
