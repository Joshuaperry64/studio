
'use client';

import { analyzeUserInput } from '@/ai/flows/analyze-user-input';
import { voiceToVoiceChat } from '@/ai/flows/voice-to-voice-chat';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUri } from '@/lib/utils';
import { Bot, Loader2, Mic, Paperclip, Send, X, Plus, Trash2 } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useCharacterStore } from '@/store/character-store';
import { useUserStore } from '@/store/user-store';
import { WelcomeDialog } from '@/components/welcome-dialog';
import { useSettingsStore, SafetySettings } from '@/store/settings-store';
import { useChatStore } from '@/store/chat-store';
import ChatMessage, { ThinkingMessage } from '@/components/ChatMessage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ChatPage() {
  const { 
    conversations, 
    activeConversationId, 
    addMessageToConversation, 
    startLoading, 
    stopLoading, 
    isLoading,
    addConversation,
    removeConversation,
    setActiveConversationId,
    getCurrentConversation,
    getConversationById,
    clearChat,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaAttachment, setMediaAttachment] = useState<File | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const { activeCharacter } = useCharacterStore();
  const { user } = useUserStore();
  const { hasSeenWelcomeScreen, setHasSeenWelcomeScreen, textModel, safetySettings } = useSettingsStore();
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  
  const activeConversation = getCurrentConversation();
  const messages = activeConversation?.messages || [];


  useEffect(() => {
    if (!hasSeenWelcomeScreen) {
      setIsWelcomeOpen(true);
    }
  }, [hasSeenWelcomeScreen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);
  
  const playAudio = (audioDataUri: string) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.src = audioDataUri;
      audioPlayerRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && !mediaAttachment) || !activeConversationId) return;

    const userMessageText = input;
    const userMessageAttachment = mediaAttachment;

    setInput('');
    setMediaAttachment(null);
    startLoading(activeConversationId);

    addMessageToConversation(activeConversationId, {
      id: Date.now(),
      sender: 'user' as const,
      text: userMessageText,
      photo: userMessageAttachment?.type.startsWith('image/') ? URL.createObjectURL(userMessageAttachment) : undefined,
      video: userMessageAttachment?.type.startsWith('video/') ? URL.createObjectURL(userMessageAttachment) : undefined,
    });

    const photoDataUri = userMessageAttachment?.type.startsWith('image/') ? await fileToDataUri(userMessageAttachment) : undefined;
    const videoDataUri = userMessageAttachment?.type.startsWith('video/') ? await fileToDataUri(userMessageAttachment) : undefined;


    try {
      const voiceName = activeCharacter?.voiceName;
      const characterDetails = activeCharacter ? {
        name: activeCharacter.name,
        personality: activeCharacter.personality,
        backstory: activeCharacter.backstory,
      } : undefined;

      const formattedSafetySettings = Object.entries(safetySettings).map(([category, threshold]) => ({
            category,
            threshold,
      }));


      const result = await analyzeUserInput({
        textPrompt: userMessageText,
        photoDataUri,
        videoDataUri,
        voiceName,
        characterDetails,
        modelName: textModel,
        safetySettings: formattedSafetySettings,
      });
      
      addMessageToConversation(activeConversationId, {
        id: Date.now() + 1,
        sender: 'ai' as const,
        text: result.analysisResult,
        character: activeCharacter ? { name: activeCharacter.name, avatar: activeCharacter.avatarDataUri } : undefined,
      });
      
      if (result.audioDataUri) {
        playAudio(result.audioDataUri);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response from AI.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
       if (activeConversationId) {
        const convo = getConversationById(activeConversationId);
        if (convo) {
            convo.messages.pop();
        }
       }
    } finally {
      stopLoading(activeConversationId);
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], 'voice_input.webm', { type: 'audio/webm' });
          handleVoiceInput(audioFile);
          stream.getTracks().forEach((track) => track.stop());
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        toast({ title: 'Error', description: 'Microphone access denied or failed to start recording.', variant: 'destructive' });
      }
    }
  };

  const handleVoiceInput = async (audioFile: File) => {
     if (!activeConversationId) return;

    startLoading(activeConversationId);
    
    try {
      const audioDataUri = await fileToDataUri(audioFile);
      const voiceName = activeCharacter?.voiceName || 'Algenib';
      const characterDetails = activeCharacter ? {
        name: activeCharacter.name,
        personality: activeCharacter.personality,
        backstory: activeCharacter.backstory,
      } : undefined;
      
      const result = await voiceToVoiceChat({ audioDataUri, voiceName, characterDetails });

      addMessageToConversation(activeConversationId, {
          id: Date.now(),
          sender: 'user' as const,
          text: result.transcription,
      });

      addMessageToConversation(activeConversationId, {
          id: Date.now() + 1,
          sender: 'ai' as const,
          text: result.responseText,
          character: activeCharacter ? { name: activeCharacter.name, avatar: activeCharacter.avatarDataUri } : undefined,
      });

      if (result.audioDataUri) {
        playAudio(result.audioDataUri);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process voice input.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      if (activeConversationId) {
        stopLoading(activeConversationId);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({ title: 'Error', description: 'File size cannot exceed 10MB.', variant: 'destructive' });
        return;
      }
      setMediaAttachment(file);
    }
  };

  const handleClearChat = () => {
    if (activeConversationId) {
        clearChat(activeConversationId);
        toast({
            title: 'Chat Cleared',
            description: `The history for "${activeConversation?.name}" has been cleared.`,
        });
    }
  };

  return (
    <>
      <audio ref={audioPlayerRef} className="hidden" />
      <WelcomeDialog
        open={isWelcomeOpen}
        onOpenChange={(open) => {
          setIsWelcomeOpen(open);
          if (!open) {
            setHasSeenWelcomeScreen(true);
          }
        }}
      />
      <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-4rem)]">
        <Tabs value={activeConversationId || ''} onValueChange={setActiveConversationId} className="flex flex-col h-full">
            <div className="flex items-center border-b px-4">
                 <TabsList className="bg-transparent p-0">
                    {conversations.map(convo => (
                        <TabsTrigger
                            key={convo.id}
                            value={convo.id}
                            className="relative pr-8 data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none data-[state=inactive]:text-muted-foreground rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-none"
                        >
                            {convo.name}
                            {conversations.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeConversation(convo.id);
                                    }}
                                    className="absolute top-1/2 right-1 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
                                >
                                    <X className="h-3 w-3"/>
                                </button>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>
                 <Button variant="ghost" size="icon" className="h-8 w-8 ml-2" onClick={() => addConversation()}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
           
            <TabsContent value={activeConversationId || ''} className="flex-grow flex flex-col mt-0">
                 <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-6 max-w-3xl mx-auto">
                        {messages.length === 0 && !isLoading && (
                        <div className="text-center text-muted-foreground pt-16">
                            <Bot size={48} className="mx-auto" />
                            <h2 className="text-2xl font-headline mt-4">
                            {activeCharacter ? `Chatting as ${activeCharacter.name}` : 'Welcome to AlphaLink'}
                            </h2>
                            <p>Start the conversation by typing a message below.</p>
                        </div>
                        )}
                        {messages.map((message) => (
                        <ChatMessage 
                            key={message.id}
                            message={message}
                            userAvatar={user?.avatar}
                            userName={user?.username}
                        />
                        ))}
                        {isLoading && <ThinkingMessage activeCharacter={activeCharacter} />}
                    </div>
                </ScrollArea>
                <div className="border-t p-4 bg-background">
                    <div className="max-w-3xl mx-auto relative">
                        {mediaAttachment && (
                        <div className="absolute bottom-full left-0 mb-2">
                            <Badge variant="secondary" className="flex items-center gap-2 p-2">
                            <span>{mediaAttachment.name}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4"
                                onClick={() => setMediaAttachment(null)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                            </Badge>
                        </div>
                        )}
                        <div className="relative">
                        <Textarea
                            placeholder={
                            activeCharacter ? `Message ${activeCharacter.name}...` : 'Type your message or use the microphone...'
                            }
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                            }}
                            rows={1}
                            className="pr-36 min-h-[48px] resize-none"
                            disabled={!activeConversationId}
                        />
                        <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex gap-1">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    disabled={isLoading || messages.length === 0}
                                    >
                                    <Trash2 className="h-5 w-5" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete all messages in the current conversation. This action cannot be undone.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearChat}>
                                        Clear History
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading || isRecording || !activeConversationId}
                            >
                            <Paperclip className="h-5 w-5" />
                            </Button>
                            <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*,video/*"
                            />
                            <Button
                            type="button"
                            size="icon"
                            variant={isRecording ? 'destructive' : 'ghost'}
                            onClick={handleMicClick}
                            disabled={isLoading || !activeConversationId}
                            className={isRecording ? 'animate-pulse-slow' : ''}
                            >
                            {isLoading && !isRecording ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
                            </Button>
                            <Button
                            type="submit"
                            size="icon"
                            onClick={handleSendMessage}
                            disabled={isLoading || (!input.trim() && !mediaAttachment) || !activeConversationId}
                            >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            </Button>
                        </div>
                        </div>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
