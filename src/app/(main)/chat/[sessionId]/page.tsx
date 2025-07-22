
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, orderBy, onSnapshot, Timestamp, doc } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Users } from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { useToast } from '@/hooks/use-toast';
import { saveMessageToSessionFlow } from '@/ai/flows/save-message-to-session';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelative } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  senderUsername: string;
  text?: string;
  mediaUrl?: string;
  timestamp: Timestamp;
}

interface Participant {
    id: string;
    userId: string;
    username: string;
    joinedAt: Timestamp;
}

export default function CollaborativeChatPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const { user } = useUserStore();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Combined effect for real-time listeners
  useEffect(() => {
      if (!sessionId) return;
      
      setLoading(true);
      
      // Listener for session details (like the name)
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionUnsubscribe = onSnapshot(sessionRef, (doc) => {
          if (doc.exists()) {
              setSessionName(doc.data().name);
          } else {
              setError("Session not found.");
          }
      }, (err) => {
          console.error("Error fetching session details:", err);
          setError("Failed to load session details.");
      });

      // Listener for messages
      const messagesColRef = collection(db, 'sessions', sessionId, 'messages');
      const messagesQuery = query(messagesColRef, orderBy('timestamp'));
      const messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const newMessages = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
          })) as Message[];
          setMessages(newMessages);
          if (loading) setLoading(false);
      }, (err) => {
          console.error('Error listening for messages:', err);
          setError('Failed to listen for messages.');
          setLoading(false);
      });

      // Listener for participants
      const participantsColRef = collection(db, 'sessions', sessionId, 'participants');
      const participantsQuery = query(participantsColRef, orderBy('joinedAt'));
      const participantsUnsubscribe = onSnapshot(participantsColRef, (snapshot) => {
          const newParticipants = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
          })) as Participant[];
          setParticipants(newParticipants);
      }, (err) => {
          console.error('Error listening for participants:', err);
          // Non-critical error, so we don't set the main error state
          toast({ title: "Warning", description: "Could not fetch participant list.", variant: "destructive" });
      });

      // Cleanup function to unsubscribe from all listeners
      return () => {
          sessionUnsubscribe();
          messagesUnsubscribe();
          participantsUnsubscribe();
      };
  }, [sessionId, toast]); // Re-run effect if sessionId changes


  const handleSendMessage = async () => {
      if (!inputMessage.trim() || sendingMessage || !user) return;

      setSendingMessage(true);
      try {
          const result = await saveMessageToSessionFlow({
              sessionId,
              userId: user.userId,
              username: user.username,
              text: inputMessage,
          });

          if (result.success) {
              setInputMessage('');
          } else {
              toast({ title: 'Error', description: result.errorMessage || 'Failed to send message.', variant: 'destructive' });
          }
      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
          toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      } finally {
          setSendingMessage(false);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
      }
  };

  if (loading) {
    return (
      <main className="p-4 sm:p-6 flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading Session...</p>
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
    <main className="p-4 sm:p-6 flex h-[calc(100vh-5rem)]">
      <div className="flex-grow flex flex-col h-full">
         <div className="flex-shrink-0 mb-4">
            <h1 className="text-2xl font-headline">{sessionName || `Session ID: ${sessionId}`}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mt-1">
                <Users className="h-4 w-4" />
                <span>{participants.length} Participant{participants.length !== 1 ? 's' : ''}:</span>
                 <div className="flex flex-wrap gap-1">
                    {participants.map((p, index) => (
                        <Badge key={p.id} variant={p.userId === user?.userId ? 'default' : 'secondary'}>{p.username}</Badge>
                    ))}
                </div>
            </div>
        </div>

        <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-16">
                    <p>No messages yet. Start the conversation!</p>
                </div>
            ) : (
                messages.map((message) => (
                <div key={message.id} className={`flex items-end gap-2 ${message.senderId === user?.userId ? 'justify-end' : ''}`}>
                    <div className={`flex flex-col space-y-1 max-w-lg ${message.senderId === user?.userId ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2 rounded-lg inline-block ${message.senderId === user?.userId ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                           <p className="text-sm">{message.text}</p>
                        </div>
                        <div className="flex items-center gap-1">
                             <span className="text-xs font-bold">{message.senderUsername}</span>
                            <span className="text-xs text-muted-foreground">
                                {formatRelative(message.timestamp.toDate(), new Date())}
                            </span>
                        </div>
                    </div>
                </div>
                ))
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 border-t pt-4">
            <div className="relative">
                <Textarea
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    className="pr-24 min-h-[48px] resize-none"
                    disabled={sendingMessage}
                />
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || sendingMessage} className="absolute top-1/2 right-2 -translate-y-1/2">
                    {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Send</span>
                </Button>
            </div>
        </div>
      </div>
    </main>
  );
}
