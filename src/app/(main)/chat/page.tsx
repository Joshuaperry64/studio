'use client';

import { analyzeUserInput } from '@/ai/flows/analyze-user-input';
import { enableVoiceInput } from '@/ai/flows/enable-voice-input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUri } from '@/lib/utils';
import { Bot, Loader2, Mic, Paperclip, Send, User, X } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useCharacterStore } from '@/store/character-store';
import { useUserStore } from '@/store/user-store';
import { WelcomeDialog } from '@/components/welcome-dialog';
import { useSettingsStore } from '@/store/settings-store';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  photo?: string;
  video?: string;
  character?: {
      name: string;
      avatar: string;
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaAttachment, setMediaAttachment] = useState<File | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { activeCharacter } = useCharacterStore();
  const { user } = useUserStore();
  const { hasSeenWelcomeScreen, setHasSeenWelcomeScreen } = useSettingsStore();
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  
  useEffect(() => {
    // Only show the welcome screen if it hasn't been seen before.
    // The dialog's onOpenChange will handle setting the state.
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
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() && !mediaAttachment) return;
    setIsLoading(true);

    const userMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: input,
      photo: mediaAttachment?.type.startsWith('image/') ? URL.createObjectURL(mediaAttachment) : undefined,
      video: mediaAttachment?.type.startsWith('video/') ? URL.createObjectURL(mediaAttachment) : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    
    const photoDataUri = mediaAttachment?.type.startsWith('image/') ? await fileToDataUri(mediaAttachment) : undefined;
    const videoDataUri = mediaAttachment?.type.startsWith('video/') ? await fileToDataUri(mediaAttachment) : undefined;
    
    setInput('');
    setMediaAttachment(null);
    
    try {
      const result = await analyzeUserInput({
        textPrompt: input,
        photoDataUri,
        videoDataUri
      });
      const aiMessage: Message = { 
          id: Date.now() + 1, 
          sender: 'ai', 
          text: result.analysisResult,
          character: activeCharacter ? {name: activeCharacter.name, avatar: activeCharacter.avatarDataUri} : undefined
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get response from AI.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
      setMessages(prev => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setIsLoading(false);
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
          const audioFile = new File([audioBlob], "voice_input.webm", { type: "audio/webm" });
          handleVoiceInput(audioFile);
          stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (error) {
        toast({ title: 'Error', description: 'Microphone access denied.', variant: 'destructive' });
      }
    }
  };

  const handleVoiceInput = async (audioFile: File) => {
    setIsLoading(true);
    try {
      const audioDataUri = await fileToDataUri(audioFile);
      const result = await enableVoiceInput({ audioDataUri });
      setInput(prev => prev ? `${prev} ${result.transcription}` : result.transcription);
    } catch (error) {
       const errorMessage = error instanceof Error ? error.message : 'Failed to transcribe audio.';
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
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

  return (
    <>
    <WelcomeDialog open={isWelcomeOpen} onOpenChange={(open) => {
        setIsWelcomeOpen(open);
        // If the dialog is closing, mark it as seen.
        if (!open) {
            setHasSeenWelcomeScreen(true);
        }
    }}/>
    <div className="flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-4rem)]">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6 max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground pt-16">
              <Bot size={48} className="mx-auto" />
              <h2 className="text-2xl font-headline mt-4">
                {activeCharacter ? `Chatting as ${activeCharacter.name}`: "Welcome to AlphaLink"}
              </h2>
              <p>Start the conversation by typing a message below.</p>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-4 ${message.sender === 'user' ? 'justify-end' : ''}`}>
              {message.sender === 'ai' && (
                <Avatar>
                  <AvatarImage src={message.character?.avatar} alt={message.character?.name} />
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
              )}
              <div className={`max-w-[75%] rounded-lg p-3 ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                {message.character && <p className="text-xs font-bold mb-1">{message.character.name}</p>}
                <p className="whitespace-pre-wrap">{message.text}</p>
                {message.photo && (
                  <div className="mt-2 rounded-md overflow-hidden">
                    <Image src={message.photo} alt="User upload" width={300} height={200} className="max-w-full h-auto" data-ai-hint="photo attachment"/>
                  </div>
                )}
                {message.video && (
                  <video src={message.video} controls className="mt-2 rounded-md max-w-full" data-ai-hint="video attachment"/>
                )}
              </div>
              {message.sender === 'user' && (
                <Avatar>
                  <AvatarImage src="https://placehold.co/40x40" alt={user?.username} />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && messages.length > 0 && messages[messages.length-1].sender === 'user' && (
             <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={activeCharacter?.avatarDataUri} alt={activeCharacter?.name} />
                  <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <div className="max-w-[75%] rounded-lg p-3 bg-secondary flex items-center">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-background">
        <div className="max-w-3xl mx-auto relative">
          {mediaAttachment && (
            <div className="absolute bottom-full left-0 mb-2">
              <Badge variant="secondary" className="flex items-center gap-2 p-2">
                <span>{mediaAttachment.name}</span>
                <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setMediaAttachment(null)}>
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            </div>
          )}
          <div className="relative">
            <Textarea
              placeholder={activeCharacter ? `Message ${activeCharacter.name}...` : "Type your message or use the microphone..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              rows={1}
              className="pr-24 min-h-[48px] resize-none"
            />
            <div className="absolute top-1/2 right-2 transform -translate-y-1/2 flex gap-1">
              <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                <Paperclip className="h-5 w-5" />
              </Button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
              <Button type="button" size="icon" variant={isRecording ? "destructive" : "ghost"} onClick={handleMicClick} disabled={isLoading}>
                <Mic className="h-5 w-5" />
              </Button>
              <Button type="submit" size="icon" onClick={handleSendMessage} disabled={isLoading || (!input.trim() && !mediaAttachment)}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
