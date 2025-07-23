'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { collection, query, orderBy, onSnapshot, Timestamp, doc } from 'firebase/firestore';
import { db } from '@/ai/genkit';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Users, Bot } from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { useToast } from '@/hooks/use-toast';
import { saveMessageToSession } from '@/ai/flows/save-message-to-session';
import { analyzeUserInput } from '@/ai/flows/analyze-user-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelative } from 'date-fns';
import { useCharacterStore } from '@/store/character-store';
import ChatMessage from '@/components/ChatMessage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


interface Message {
  id: string;
  senderId: string;
  senderUsername: string;
  text?: string;
  mediaUrl?: string;
  timestamp: Timestamp;
  isAiMessage?: boolean;
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
  const [isSending, setIsSending] = useState(false);

  const { user } = useUserStore();
  const { activeCharacter } = useCharacterStore();
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
          toast({ title: "Warning", description: "Could not fetch participant list.", variant: "destructive" });
      });

      // Cleanup function to unsubscribe from all listeners
      return () => {
          sessionUnsubscribe();
          messagesUnsubscribe();
          participantsUnsubscribe();
      };
  }, [sessionId, toast, loading]);


  const handleSendMessage = async () => {
      if (!inputMessage.trim() || isSending || !user) return;

      setIsSending(true);
      const originalMessage = inputMessage;
      setInputMessage('');

      try {
          const result = await saveMessageToSession({
              sessionId,
              userId: user.userId,
              username: user.username,
              text: originalMessage,
          });

          if (!result.success) {
              toast({ title: 'Error', description: result.errorMessage || 'Failed to send message.', variant: 'destructive' });
              setInputMessage(originalMessage); // Restore message on failure
              return;
          }

          // Check if the message is an AI command
          if (originalMessage.trim().toLowerCase().startsWith('@ai')) {
              const aiPrompt = originalMessage.trim().substring(3).trim();
              
              const aiResult = await analyzeUserInput({
                  textPrompt: aiPrompt,
                  voiceName: activeCharacter?.voiceName,
              });

              // Save AI response to chat
              await saveMessageToSession({
                  sessionId,
                  userId: 'ai', // Special ID for AI
                  username: activeCharacter?.name || 'AI',
                  text: aiResult.analysisResult,
                  // @ts-ignore - adding a custom field
                  isAiMessage: true,
              });
          }

      } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
          toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
          setInputMessage(originalMessage); // Restore message on failure
      } finally {
          setIsSending(false);
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
                    <p>No messages yet. Start the conversation! Mention <code className="bg-muted px-1.5 py-1 rounded-sm">@ai</code> to talk to the AI.</p>
                </div>
            ) : (
                messages.map((message) => (
                    <ChatMessage
                        key={message.id}
                        message={message}
                        currentUserId={user?.userId}
                        userName={user?.username}
                        activeCharacter={activeCharacter}
                    />
                ))
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 border-t pt-4">
            <div className="relative">
                <Textarea
                    placeholder="Type your message... use '@ai' to talk to the AI."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    className="pr-24 min-h-[48px] resize-none"
                    disabled={isSending}
                />
                <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isSending} className="absolute top-1/2 right-2 -translate-y-1/2">
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="sr-only">Send</span>
                </Button>
            </div>
        </div>
      </div>
    </main>
  );
}
