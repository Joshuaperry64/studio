
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
import { Message } from '@/store/chat-store';

interface ChatMessageProps {
  message: Message;
  userAvatar?: string;
  userName?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, userAvatar, userName }) => {
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    if (text) {
      copy(text);
      toast({ title: 'Copied to clipboard!' });
    }
  };

  const renderMedia = () => {
    if (message.photo) {
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
    if (message.video) {
        return (
            <div className="mt-2 rounded-md overflow-hidden relative max-w-xs">
                 <video src={message.video} controls className="max-w-full h-auto" />
            </div>
        )
    }
    return null;
  };

  const isUserMessage = message.sender === 'user';

  return (
    <div
      key={message.id}
      className={`flex items-start gap-4 ${isUserMessage ? 'justify-end' : ''}`}
    >
      {!isUserMessage && (
        <Avatar>
          <AvatarImage src={message.character?.avatar} alt={message.character?.name || 'AI'} />
          <AvatarFallback>
            <Bot />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={`max-w-[75%] rounded-lg p-3 ${
          isUserMessage ? 'bg-primary text-primary-foreground' : 'bg-secondary'
        }`}
      >
        <p className={`text-xs font-bold mb-1 ${isUserMessage ? 'text-right' : 'text-left'}`}>{isUserMessage ? userName : (message.character?.name || 'AI')}</p>

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
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback>
            {userName?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
