
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Globe, Bot, Server, Clock, Sun, Cloud, Thermometer, MapPin, Sparkles, History, Users, UserCheck, UserX, CheckCircle, AlertCircle, Wifi } from 'lucide-react';
import { onSnapshot, doc, collection, query, orderBy, getCountFromServer, where, getDocs } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/store/settings-store';
import { useUserStore } from '@/store/user-store';

interface Entity {
  id: string;
  name: string;
  location: string;
  status: string;
}

interface WorldState {
  name: string;
  timeOfDay: string;
  weather: string;
}

interface UserStats {
    total: number;
    approved: number;
    pending: number;
}

interface ActiveSession {
    id: string;
    name: string;
    createdBy: string;
}

export default function DashboardPage() {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loadingWorld, setLoadingWorld] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const { memorySettings } = useSettingsStore();
  const { user } = useUserStore();

  const { toast } = useToast();
  
  useEffect(() => {
    // Fetch World State
    const worldRef = doc(db, 'virtual-worlds', 'main');
    const unsubWorld = onSnapshot(worldRef, (doc) => {
        if (doc.exists()) setWorldState(doc.data() as WorldState);
        setLoadingWorld(false);
    }, (err) => {
        console.error("Error fetching world state:", err);
        setLoadingWorld(false);
    });

    // Fetch Entities
    const entitiesRef = collection(db, 'virtual-worlds', 'main', 'entities');
    const unsubEntities = onSnapshot(entitiesRef, (snapshot) => {
        setEntities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Entity[]);
    });

    // Fetch User and Session Stats
    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            // User Stats
             const usersRef = collection(db, 'users');
             const totalSnapshot = await getCountFromServer(usersRef);
             const approvedQuery = query(usersRef, where('status', '==', 'approved'));
             const approvedSnapshot = await getCountFromServer(approvedQuery);
             const pendingQuery = query(usersRef, where('status', '==', 'pending'));
             const pendingSnapshot = await getCountFromServer(pendingQuery);
             setUserStats({
                 total: totalSnapshot.data().count,
                 approved: approvedSnapshot.data().count,
                 pending: pendingSnapshot.data().count,
             });

            // Session Stats
             const sessionsRef = collection(db, 'copilot-sessions');
             const q = query(sessionsRef, orderBy('createdAt', 'desc'));
             const sessionsSnapshot = await getDocs(q);
             const sessions = sessionsSnapshot.docs.map(doc => ({
                 id: doc.id,
                 name: doc.data().name,
                 createdBy: doc.data().createdBy,
             }));
             setActiveSessions(sessions);

        } catch (error) {
             toast({ title: 'Error', description: 'Failed to fetch dashboard statistics.', variant: 'destructive' });
        } finally {
            setLoadingStats(false);
        }
    };
    
    if (user?.role === 'admin') {
      fetchStats();
    } else {
      setLoadingStats(false);
    }


    return () => {
      unsubWorld();
      unsubEntities();
    };
  }, [toast, user]);


  return (
    <main className="p-4 sm:p-6 flex-1">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-headline">Dashboard</h1>
          <p className="text-muted-foreground">High-level overview of the AlphaLink system.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* World State Card */}
            <Card className="lg:col-span-2">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Globe /> Virtual Environment Status</CardTitle>
                    <CardDescription>Real-time data from the primary simulation.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingWorld ? <Loader2 className="animate-spin" /> : (
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col items-center justify-center p-4 bg-secondary rounded-lg">
                                <Clock className="h-6 w-6 mb-2 text-muted-foreground"/>
                                <span className="text-xs text-muted-foreground">Time of Day</span>
                                <span className="font-bold text-lg">{worldState?.timeOfDay}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-secondary rounded-lg">
                                <Cloud className="h-6 w-6 mb-2 text-muted-foreground"/>
                                <span className="text-xs text-muted-foreground">Weather</span>
                                <span className="font-bold text-lg">{worldState?.weather}</span>
                            </div>
                             <div className="flex flex-col items-center justify-center p-4 bg-secondary rounded-lg">
                                <Bot className="h-6 w-6 mb-2 text-muted-foreground"/>
                                <span className="text-xs text-muted-foreground">Entities</span>
                                <span className="font-bold text-lg">{entities.length}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 bg-secondary rounded-lg">
                                <Thermometer className="h-6 w-6 mb-2 text-muted-foreground"/>
                                <span className="text-xs text-muted-foreground">Temperature</span>
                                <span className="font-bold text-lg">22°C</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* System Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Server /> System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-1">
                    <div className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>Firebase Services: <span className="font-semibold">Operational</span></span>
                    </div>
                    <div className="flex items-center text-sm">
                        {memorySettings.enabled ? <Wifi className="h-4 w-4 mr-2 text-green-500" /> : <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />}
                        <span>Persistent Memory: <span className="font-semibold">{memorySettings.enabled ? 'Enabled' : 'Disabled'}</span></span>
                    </div>
                    <div className="flex items-center text-sm">
                        <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                        <span>Google Home: <span className="font-semibold">Not Connected</span></span>
                    </div>
                    <div className="flex items-center text-sm">
                        <AlertCircle className="h-4 w-4 mr-2 text-yellow-500" />
                        <span>Amazon Alexa: <span className="font-semibold">Not Connected</span></span>
                    </div>
                </CardContent>
            </Card>

            {user?.role === 'admin' && (
              <>
                 {/* User Stats Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users /> Operator Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {loadingStats || !userStats ? <Loader2 className="animate-spin" /> : (
                            <>
                                <div className="text-4xl font-bold">{userStats.total}</div>
                                <p className="text-xs text-muted-foreground">Total Operators</p>
                                <div className="flex space-x-4 mt-4 text-sm text-muted-foreground">
                                    <div className="flex items-center"><UserCheck className="h-4 w-4 mr-1 text-green-500"/> Approved: {userStats.approved}</div>
                                    <div className="flex items-center"><UserX className="h-4 w-4 mr-1 text-yellow-500"/> Pending: {userStats.pending}</div>
                                </div>
                            </>
                         )}
                    </CardContent>
                </Card>

                {/* Active Sessions Card */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Sparkles /> Active Co-Pilot Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loadingStats ? <Loader2 className="animate-spin" /> : 
                        activeSessions.length > 0 ? (
                            <div className="space-y-2">
                                {activeSessions.map((session) => (
                                    <div key={session.id} className="flex justify-between items-center p-2 bg-secondary rounded-md">
                                        <div>
                                            <p className="font-semibold">{session.name}</p>
                                            <p className="text-xs text-muted-foreground">Created by {session.createdBy}</p>
                                        </div>
                                        <Button asChild variant="ghost" size="sm">
                                            <Link href={`/co-pilot/${session.id}`}>View</Link>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No active co-pilot sessions.</p>
                        )}
                    </CardContent>
                </Card>
              </>
            )}
        </div>
      </div>
    </main>
  );
}
