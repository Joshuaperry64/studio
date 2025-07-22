'use client';

import React, { useRef } from 'react';
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

interface ChatMessageProps {
  message: {
    id: string; // Use string for Firestore doc ID
    senderId: string;
    senderUsername: string;
    text?: string;
    mediaUrl?: string;
    timestamp: any; // Use any for Timestamp initially, or convert
    character?: { name: string; avatar: string }; // Keep character for AI messages
  };
  currentUser:
  | {
      userId: string | number;
      username: string;
      avatar?: string;
    }
  | null;
  aiAvatar?: string; // Optional AI avatar for when no character is set
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUser,
  aiAvatar,
}) => {
  const { toast } = useToast();

  const handleCopy = (text: string | undefined) => {
    if (text) {
      copy(text);
      toast({ title: 'Copied to clipboard!' });
    }
  };

  const handleDownload = (url: string | undefined, filename: string) => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderMedia = () => {
    if (message.mediaUrl) {
      const isImage = message.mediaUrl.match(/.(jpeg|jpg|gif|png)$/i);
      const isVideo = message.mediaUrl.match(/.(mp4|webm|ogg)$/i);
      const filename = message.mediaUrl.substring(message.mediaUrl.lastIndexOf('/') + 1);

      return (
        <div className="mt-2 rounded-md overflow-hidden relative max-w-xs">
          {isImage && (
            <Image
              src={message.mediaUrl}
              alt="Media attachment"
              width={300}
              height={200}
              className="max-w-full h-auto"
            />
          )}
          {isVideo && (
            <video src={message.mediaUrl} controls className="max-w-full h-auto" />
          )}
          {!isImage && !isVideo && (
              <p>Unsupported media type</p>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full"
            onClick={() => handleDownload(message.mediaUrl, filename)}
            aria-label="Download media"
          >
            <Download size={16} />
          </Button>
        </div>
      );
    }
    return null;
  };

  const isUserMessage = currentUser && message.senderId === currentUser.userId;

  return (
    <div
      key={message.id}
      className={`flex items-start gap-4 ${isUserMessage ? 'justify-end' : ''}`}
    >
      {!isUserMessage && (
        <Avatar>
          {/* Display AI character avatar if available, otherwise a default bot icon */}
          <AvatarImage src={message.character?.avatar || aiAvatar} alt={message.character?.name || 'AI'} />
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
        {/* Display sender username */}
        <p className={`text-xs font-bold mb-1 ${isUserMessage ? 'text-right' : 'text-left'}`}>{isUserMessage ? currentUser?.username : message.senderUsername}</p>

        {/* Render text content with markdown and code highlighting */}
        {message.text && (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(w+)/.exec(className || '');
                return !inline && match ? (
                  <div className="relative">
                    <SyntaxHighlighter
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/
$/, '')}
                    </SyntaxHighlighter>
                    <button
                      onClick={() => handleCopy(String(children).replace(/
$/, ''))}
                      className="absolute top-2 right-2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-1"
                      aria-label="Copy code snippet"
                    >
                      <Copy size={16} />
                    </button>
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

        {/* Render media attachment */}
        {renderMedia()}

      </div>
      {isUserMessage && (
        <Avatar>
          <AvatarImage src={currentUser?.avatar} alt={currentUser?.username} />
          <AvatarFallback>
            {currentUser?.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;
