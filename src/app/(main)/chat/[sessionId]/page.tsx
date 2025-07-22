'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getSessionMessagesFlow } from '@/ai/flows/get-session-messages';
import { saveMessageToSessionFlow } from '@/ai/flows/save-message-to-session';
import { getSessionParticipantsFlow } from '@/ai/flows/get-session-participants';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/ai/genkit'; // Import the Firestore instance
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Users } from 'lucide-react';
import { useUserStore } from '@/store/user-store'; // Assuming user info is in user-store
import { useToast } from '@/hooks/use-toast';

interface Message {
  senderId: string;
  senderUsername: string;
  text?: string;
  mediaUrl?: string;
  timestamp: Timestamp; // Use Timestamp type for real-time updates
}

interface Participant {
    userId: string;
    username: string;
    joinedAt: any; // Use any for Timestamp initially
}

export default function CollaborativeChatPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [fetchingMessagesError, setFetchingMessagesError] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const { user } = useUserStore(); // Get user info from the store
  const { toast } = useToast();

  // Effect to fetch initial messages
  useEffect(() => {
    const fetchInitialMessages = async () => {
      if (!sessionId) return;

      try {
        const result = await getSessionMessagesFlow({ sessionId });
        if (result.errorMessage) {
          setFetchingMessagesError(result.errorMessage);
          setLoadingMessages(false);
          return;
        }
        setMessages(result.messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp, // Assuming timestamp is already in a usable format or convert here
        })) as Message[]); // Cast to Message[]
        setLoadingMessages(false);
      } catch (err) {
        setFetchingMessagesError('Failed to fetch initial messages.');
        setLoadingMessages(false);
      }
    };

    fetchInitialMessages();
  }, [sessionId]);

  // Effect for real-time message listener
  useEffect(() => {
      if (!sessionId) return;

      const messagesCollectionRef = collection(db, 'sessions', sessionId, 'messages');
      const messagesQuery = query(messagesCollectionRef, orderBy('timestamp'));

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const newMessages = snapshot.docs.map(doc => ({
              id: doc.id, // Include doc.id for potential key in list rendering
              ...doc.data()
          })) as Message[]; // Cast to Message[]

          // Update messages, assuming Firestore delivers them in order
          setMessages(newMessages);

          if (loadingMessages) { // Stop loading if it's the first update from the listener
              setLoadingMessages(false);
          }
      }, (error) => {
          console.error('Error listening for messages:', error);
          setFetchingMessagesError('Failed to listen for messages.');
          setLoadingMessages(false);
      });

      // Cleanup function to unsubscribe from the listener
      return () => unsubscribe();
  }, [sessionId]); // Re-run effect if sessionId changes

  // Effect for real-time participant listener
  useEffect(() => {
      if (!sessionId) return;

      const participantsCollectionRef = collection(db, 'sessions', sessionId, 'participants');

      const unsubscribe = onSnapshot(participantsCollectionRef, (snapshot) => {
          const newParticipants = snapshot.docs.map(doc => ({
              id: doc.id, // Include doc.id for potential key
              ...doc.data()
          })) as Participant[]; // Cast to Participant[]
          setParticipants(newParticipants);
      }, (error) => {
          console.error('Error listening for participants:', error);
          // Handle participant listening error if needed
      });

      // Cleanup function to unsubscribe from the listener
      return () => unsubscribe();
  }, [sessionId]); // Re-run effect if sessionId changes


  const handleSendMessage = async () => {
      if (!inputMessage.trim() || sendingMessage) return; // Prevent sending empty messages or multiple messages at once

      if (!user || !user.userId || !user.username) {
          toast({ title: 'Error', description: 'User information not available.', variant: 'destructive' });
          return;
      }

      setSendingMessage(true);

      try {
          const result = await saveMessageToSessionFlow({
              sessionId,
              userId: user.userId,
              username: user.username,
              text: inputMessage,
              // Add mediaUrl here if you implement media sharing in collaborative chat
          });

          if (result.success) {
              setInputMessage(''); // Clear input after sending
          } else if (result.errorMessage) {
              toast({ title: 'Error', description: result.errorMessage, variant: 'destructive' });
          } else {
              toast({ title: 'Error', description: 'Failed to send message.', variant: 'destructive' });
          }
      } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to send message.';
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

  if (loadingMessages) {
    return (
      <main className="p-4 sm:p-6 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-headline mb-4">Collaborative Chat</h1>
          <p>Loading messages...</p>
        </div>
      </main>
    );
  }

  if (fetchingMessagesError) {
    return (
      <main className="p-4 sm:p-6 flex-1">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-headline mb-4">Collaborative Chat</h1>
          <p className="text-red-500">Error: {fetchingMessagesError}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6 flex-1 flex flex-col h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto w-full flex-grow overflow-y-auto">
        <h1 className="text-2xl font-headline mb-4">Collaborative Chat (Session ID: {sessionId})</h1>

        <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Participants ({participants.length})</h2>
            <div className="flex flex-wrap gap-2 mb-4">
                {participants.map(participant => (
                    <span key={participant.userId} className="bg-muted px-3 py-1 rounded-full text-sm">{participant.username}</span>
                ))}
            </div>
        </div>

        <div className="space-y-4">
          {messages.length === 0 ? (
            <p>No messages yet. Start the conversation!</p>
          ) : (
            messages.map((message, index) => (
              <div key={message.id || index} className="border p-4 rounded-md">
                <p><strong>{message.senderUsername}:</strong> {message.text}</p>
                {/* Display media if available */}
                {/* {message.mediaUrl && <img src={message.mediaUrl} alt="Media" />} */}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 border-t p-4 bg-background">
          <div className="max-w-3xl mx-auto flex gap-2 items-center">
              <Textarea
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  className="flex-grow resize-none"
                  disabled={sendingMessage}
              />
              <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || sendingMessage}>
                  {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
              </Button>
          </div>
      </div>
    </main>
  );
}
