'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Users } from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { useRouter } from 'next/navigation';
import { createCoPilotSession } from '@/ai/flows/create-copilot-session';
import { listCoPilotSessions } from '@/ai/flows/list-copilot-sessions';
import { formatDistanceToNow } from 'date-fns';

const formSchema = z.object({
  sessionName: z.string().min(5, 'Session name must be at least 5 characters.'),
  projectDescription: z.string().min(20, 'Project description must be at least 20 characters.'),
  aiPersonaDescription: z.string().min(10, 'AI persona must be at least 10 characters.'),
});

interface CoPilotSession {
    id: string;
    name: string;
    projectDescription: string;
    aiPersonaDescription: string;
    createdBy: string;
    createdAt: any;
}

export default function CoPilotLobbyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<CoPilotSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const { user } = useUserStore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionName: '',
      projectDescription: '',
      aiPersonaDescription: 'A helpful and creative assistant',
    },
  });

  const fetchSessions = async () => {
    try {
      const { sessions: fetchedSessions, errorMessage } = await listCoPilotSessions();
      if (errorMessage) {
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      } else {
        setSessions(fetchedSessions);
      }
    } catch (error) {
      toast({ title: 'Error fetching sessions', description: 'Could not load available co-pilot sessions.', variant: 'destructive' });
    } finally {
        setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to create a session.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { sessionId } = await createCoPilotSession({
        ...values,
        createdBy: user.username,
      });
      toast({ title: 'Success', description: `Session "${values.sessionName}" created!` });
      form.reset();
      fetchSessions(); // Refresh the list
      router.push(`/co-pilot/${sessionId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  const handleJoinSession = (sessionId: string) => {
    router.push(`/co-pilot/${sessionId}`);
  }

  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Create Co-Pilot Session</CardTitle>
                    <CardDescription>Start a new session for your team to collaborate with the AI.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                             <FormField
                                control={form.control}
                                name="sessionName"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Session Name</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Q3 Brainstorming" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="projectDescription"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Description</FormLabel>
                                    <FormControl>
                                    <Textarea placeholder="Describe your project goals, scope, and current state." {...field} rows={4} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="aiPersonaDescription"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>AI Persona</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., A critical project manager, an enthusiastic creative..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" disabled={isLoading} className="w-full">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                                Create Session
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
        
        <div className="lg:col-span-2">
            <h2 className="text-2xl font-headline mb-4">Available Sessions</h2>
             {loadingSessions ? (
                 <div className="flex items-center justify-center h-64 rounded-lg border border-dashed">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg py-24">
                    <Users size={48} />
                    <h2 className="text-xl font-semibold mt-4">No Active Sessions</h2>
                    <p>Be the first to create a new Co-Pilot session.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((session) => (
                        <Card key={session.id}>
                           <CardHeader>
                                <CardTitle>{session.name}</CardTitle>
                                <CardDescription>
                                   Created by {session.createdBy} {formatDistanceToNow(new Date(session.createdAt.seconds * 1000), { addSuffix: true })}
                                </CardDescription>
                           </CardHeader>
                           <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2">{session.projectDescription}</p>
                           </CardContent>
                           <CardFooter>
                                <Button onClick={() => handleJoinSession(session.id)} className="ml-auto">
                                    Join Session
                                </Button>
                           </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
      </div>
    </main>
  );
}
