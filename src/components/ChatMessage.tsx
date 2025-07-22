
'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, Copy, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import copy from 'copy-to-clipboard';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Timestamp } from 'firebase/firestore';

interface MessagePayload {
  id: string | number;
  text?: string;
  photo?: string; 
  video?: string;
  timestamp?: Timestamp;
}
export interface SoloChatMessage extends MessagePayload {
    sender: 'user' | 'ai';
    character?: {
        name: string;
        avatar: string;
    };
}

export interface CollaborativeMessage extends MessagePayload {
    senderId: string;
    senderUsername: string;
    isAiMessage?: boolean;
}


interface ChatMessageProps {
  message: SoloChatMessage | CollaborativeMessage;
  currentUserId?: string;
  userAvatar?: string;
  userName?: string;
  activeCharacter?: {
      name: string;
      avatarDataUri: string;
  } | null;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, currentUserId, userAvatar, userName, activeCharacter }) => {
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    if (text) {
      copy(text);
      toast({ title: 'Copied to clipboard!' });
    }
  };

  const isSoloChatMessage = 'sender' in message;
  const isUserMessage = isSoloChatMessage ? message.sender === 'user' : message.senderId === currentUserId;
  const isAiMessage = isSoloChatMessage ? message.sender === 'ai' : message.isAiMessage;

  const getSenderName = () => {
      if (isUserMessage) return userName;
      if (isAiMessage) return isSoloChatMessage ? message.character?.name : activeCharacter?.name || 'AI';
      if (!isSoloChatMessage) return message.senderUsername;
      return 'AI';
  }

  const getAvatarSrc = () => {
      if (isUserMessage) return userAvatar;
      if (isAiMessage) return isSoloChatMessage ? message.character?.avatar : activeCharacter?.avatarDataUri;
      return undefined; // Other users in collab chat don't have avatars in this component yet
  }

  const getAvatarFallback = () => {
      if (isUserMessage) return userName?.charAt(0).toUpperCase();
      if (isAiMessage) return <Bot />;
      if (!isSoloChatMessage) return message.senderUsername.charAt(0).toUpperCase();
      return '?';
  }

  const renderMedia = () => {
    if ('photo' in message && message.photo) {
      return (
        <div className="mt-2 rounded-md overflow-hidden relative max-w-xs">
          <Image
            src={message.photo}
            alt="User upload"
            width={300}
            height={200}
            className="max-w-full h-auto"
          />
        </div>
      );
    }
    if ('video' in message && message.video) {
        return (
            <div className="mt-2 rounded-md overflow-hidden relative max-w-xs">
                 <video src={message.video} controls className="max-w-full h-auto" />
            </div>
        )
    }
    return null;
  };

  return (
    <div
      key={message.id}
      className={`flex items-start gap-4 ${isUserMessage ? 'justify-end' : ''}`}
    >
      {!isUserMessage && (
        <Avatar>
          <AvatarImage src={getAvatarSrc()} />
          <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[75%] rounded-lg p-3 ${
          isUserMessage ? 'bg-primary text-primary-foreground' : isAiMessage ? 'bg-secondary' : 'bg-muted'
        }`}
      >
        <p className={`text-xs font-bold mb-1 ${isUserMessage ? 'text-right' : 'text-left'}`}>{getSenderName()}</p>

        {message.text && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeText = String(children).replace(/\n$/, '');
                return !inline && match ? (
                  <div className="relative my-2">
                    <div className="bg-[#2d2d2d] rounded-t-md px-4 py-2 text-xs text-white flex justify-between items-center">
                        <span>{match[1]}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-white"
                            onClick={() => handleCopy(codeText)}
                        >
                             <Copy size={14} />
                        </Button>
                    </div>
                    <SyntaxHighlighter
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{ margin: 0, borderBottomLeftRadius: '0.375rem', borderBottomRightRadius: '0.375rem' }}
                      {...props}
                    >
                      {codeText}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.text}
          </ReactMarkdown>
        )}
        
        {renderMedia()}

      </div>
      {isUserMessage && (
        <Avatar>
          <AvatarImage src={getAvatarSrc()} />
          <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
