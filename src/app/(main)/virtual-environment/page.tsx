
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Globe, Bot, Server, Clock, Sun, Cloud, Thermometer, MapPin, Sparkles, History, Smile, CloudRain, Diamond, CircleDollarSign } from 'lucide-react';
import { onSnapshot, doc, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { createWorld } from '@/ai/flows/world/create-world';
import { useSettingsStore } from '@/store/settings-store';

interface Entity {
  id: string;
  name: string;
  description: string;
  location: string;
  status: string;
  mood: string;
  wallet: {
    credits: number;
    digits: number;
  };
}

interface WorldEvent {
  id: string;
  timestamp: { seconds: number; nanoseconds: number };
  description: string;
  details?: Record<string, any>;
}

interface WorldState {
  name: string;
  description: string;
  timeOfDay: string;
  weather: string;
}

const weatherIcons: { [key: string]: React.ReactNode } = {
    'Clear': <Sun className="h-4 w-4 text-muted-foreground" />,
    'Rainy': <CloudRain className="h-4 w-4 text-muted-foreground" />,
    'Cloudy': <Cloud className="h-4 w-4 text-muted-foreground" />,
}

const weatherAudio: { [key: string]: string } = {
    'Clear': '/audio/ambient_clear.mp3',
    'Rainy': '/audio/ambient_rain.mp3',
}


export default function VirtualEnvironmentPage() {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { soundEnabled } = useSettingsStore();
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (soundEnabled && worldState?.weather && audioRef.current) {
      const audioSrc = weatherAudio[worldState.weather];
      if (audioSrc && audioRef.current.src !== audioSrc) {
        audioRef.current.src = audioSrc;
        audioRef.current.loop = true;
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      } else if (!audioSrc) {
        audioRef.current.pause();
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [soundEnabled, worldState?.weather]);


  useEffect(() => {
    const worldId = 'main'; // For now, we only have one world.
    const worldRef = doc(db, 'virtual-worlds', worldId);

    const unsubscribeWorld = onSnapshot(worldRef, (docSnap) => {
      if (docSnap.exists()) {
        setWorldState(docSnap.data() as WorldState);
        setError(null);
      } else {
        setError("Virtual world not found. Initializing...");
        // Initialize the world if it doesn't exist
        createWorld({
            worldId,
            name: "Alpha Simulation",
            description: "Primary simulated environment for Alpha AI.",
            initialTime: "Noon",
            initialWeather: "Clear",
        }).then(() => {
            setError(null);
            toast({ title: 'World Initialized', description: 'The primary simulation has been created.' });
        }).catch(err => {
            setError("Failed to initialize virtual world.");
            toast({ title: "Error", description: "Could not create the virtual world.", variant: "destructive" });
        });
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching world state:", err);
      setError("Failed to load world state.");
      setLoading(false);
    });

    const entitiesRef = collection(db, 'virtual-worlds', worldId, 'entities');
    const unsubscribeEntities = onSnapshot(entitiesRef, (querySnapshot) => {
        const entitiesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Entity[];
        setEntities(entitiesData);
    });

    const eventsRef = collection(db, 'virtual-worlds', worldId, 'events');
    const eventsQuery = query(eventsRef, orderBy('timestamp', 'desc'));
    const unsubscribeEvents = onSnapshot(eventsQuery, (querySnapshot) => {
        const eventsData = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}) as WorldEvent);
        setEvents(eventsData);
    });

    return () => {
      unsubscribeWorld();
      unsubscribeEntities();
      unsubscribeEvents();
    };
  }, [toast]);

  if (loading) {
    return (
      <main className="p-4 sm:p-6 flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Connecting to Virtual Environment...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-4 sm:p-6 flex-1 flex items-center justify-center">
        <p className="text-destructive">Error: {error}</p>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 flex-1">
       <audio ref={audioRef} />
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-headline flex items-center gap-2"><Globe />{worldState?.name}</h1>
          <p className="text-muted-foreground">{worldState?.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Time of Day</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{worldState?.timeOfDay}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Weather</CardTitle>
                    {worldState?.weather && weatherIcons[worldState.weather] ? weatherIcons[worldState.weather] : <Cloud className="h-4 w-4 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{worldState?.weather}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Temperature</CardTitle>
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">22°C</div>
                    <p className="text-xs text-muted-foreground">Nominal</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Entities</CardTitle>
                    <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{entities.length}</div>
                     <p className="text-xs text-muted-foreground">Active in simulation</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot />Entities</CardTitle>
                    <CardDescription>All active entities within the simulation.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {entities.length > 0 ? entities.map(entity => (
                             <Card key={entity.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{entity.name}</CardTitle>
                                    <CardDescription>{entity.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-2 text-sm">
                                    <Badge variant="secondary"><MapPin className="h-3 w-3 mr-1.5"/>Location: {entity.location}</Badge>
                                    <Badge variant="secondary"><Sparkles className="h-3 w-3 mr-1.5"/>Status: {entity.status}</Badge>
                                    <Badge variant="secondary"><Smile className="h-3 w-3 mr-1.5"/>Mood: {entity.mood}</Badge>
                                    <Badge variant="outline" className="border-amber-400/50"><Diamond className="h-3 w-3 mr-1.5 text-amber-400"/>Digits: {entity.wallet?.digits || 0}</Badge>
                                    <Badge variant="outline" className="border-sky-400/50"><CircleDollarSign className="h-3 w-3 mr-1.5 text-sky-400"/>Credits: {entity.wallet?.credits || 0}</Badge>
                                </CardContent>
                             </Card>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No entities in the simulation.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><History />Event Log</CardTitle>
                    <CardDescription>A real-time log of all events occurring in the world.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 h-[400px] overflow-y-auto pr-2">
                        {events.length > 0 ? events.map((event, index) => (
                             <div key={event.id} className="flex items-start gap-3">
                                <div className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                                    {format(new Date(event.timestamp.seconds * 1000), 'HH:mm:ss')}
                                </div>
                                <div className="w-px bg-border h-full"></div>
                                <div>
                                    <p className="text-sm">{event.description}</p>
                                </div>
                             </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No events logged yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>

      </div>
    </main>
  );
}
