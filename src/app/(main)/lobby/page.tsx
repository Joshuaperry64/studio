'use client';

import React, { useEffect, useState } from 'react';
import { listSessionsFlow } from '@/ai/flows/list-sessions';
import { createSessionFlow } from '@/ai/flows/create-session';
import { addParticipantToSessionFlow } from '@/ai/flows/add-participant-to-session';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store'; // Assuming user info is in user-store

interface Session {
  id: string;
  name: string;
  createdAt: any; // Use any for Timestamp initially
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
  const { user } = useUserStore(); // Get user info from the store

  const fetchSessions = async () => {
    try {
      const result = await listSessionsFlow({});
      if (result.errorMessage) {
        setFetchingSessionsError(result.errorMessage);
        setLoadingSessions(false);
        return;
      }
      setSessions(result.sessions);
      setLoadingSessions(false);
    } catch (err) {
      setFetchingSessionsError('Failed to fetch sessions.');
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCreateSession = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newSessionName.trim()) {
      toast({ title: 'Error', description: 'Session name cannot be empty.', variant: 'destructive' });
      return;
    }

    setCreatingSession(true);
    setCreatingSessionError(null);

    try {
      const result = await createSessionFlow({ sessionName: newSessionName });
      if (result.errorMessage) {
        setCreatingSessionError(result.errorMessage);
        toast({ title: 'Error', description: result.errorMessage, variant: 'destructive' });
        setCreatingSession(false);
        return;
      }

      toast({ title: 'Session Created', description: `Session "${newSessionName}" created successfully.` });
      setNewSessionName(''); // Clear input
      fetchSessions(); // Refresh session list

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

      // You might want to add a loading state specifically for joining a session
      // For simplicity, we'll just use a toast for feedback for now.

      try {
          const result = await addParticipantToSessionFlow({ sessionId, userId: user.userId, username: user.username });

          if (result.success) {
              toast({ title: 'Joined Session', description: result.message });
              router.push(`/chat/${sessionId}`); // Redirect to the session's chat page
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
            <p>No active sessions found.</p>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="border p-4 rounded-md flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">{session.name}</h2>
                    <p className="text-sm text-muted-foreground">Created At: {new Date(session.createdAt.seconds * 1000).toLocaleString()}</p>
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
