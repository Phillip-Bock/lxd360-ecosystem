'use client';

import { FileText, Image as ImageIcon, Paperclip, Phone, Send, Video } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  isOwn?: boolean;
  attachments?: {
    type: 'file' | 'image';
    name: string;
    url?: string;
  }[];
}

interface Conversation {
  id: string;
  contact: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
    phone?: string;
    location?: string;
    company?: string;
  };
  lastMessage?: string;
  timestamp?: string;
  unread?: number;
  isActive?: boolean;
}

interface MessagesPanelProps {
  conversations: Conversation[];
  activeConversation?: Conversation;
  messages: Message[];
  onSelectConversation?: (conversation: Conversation) => void;
  onSendMessage?: (content: string) => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  className?: string;
}

export function MessagesPanel({
  conversations,
  activeConversation,
  messages,
  onSelectConversation,
  onSendMessage,
  onCall,
  onVideoCall,
  className,
}: MessagesPanelProps): React.JSX.Element {
  const [messageInput, setMessageInput] = useState('');

  const handleSend = (): void => {
    if (messageInput.trim() && onSendMessage) {
      onSendMessage(messageInput);
      setMessageInput('');
    }
  };

  return (
    <div
      className={cn(
        'flex h-[600px] bg-card border-2 border-border rounded-[10px] overflow-hidden',
        className,
      )}
    >
      {/* Conversations List */}
      <div className="w-80 border-r border-border flex flex-col">
        {/* Active Contacts */}
        <div className="p-4 border-b border-border">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Active</h4>
          <div className="flex gap-2">
            {conversations
              .filter((c) => c.isActive)
              .slice(0, 5)
              .map((conv) => (
                <button
                  type="button"
                  key={conv.id}
                  onClick={() => onSelectConversation?.(conv)}
                  className="relative"
                  title={conv.contact.name}
                >
                  {conv.contact.avatar ? (
                    <Image
                      src={conv.contact.avatar}
                      alt={conv.contact.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {conv.contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-brand-success border-2 border-card rounded-full" />
                </button>
              ))}
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-3">Messages</h4>
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  type="button"
                  key={conv.id}
                  onClick={() => onSelectConversation?.(conv)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-[8px] transition-colors text-left',
                    activeConversation?.id === conv.id ? 'bg-primary/10' : 'hover:bg-muted',
                  )}
                >
                  <div className="relative">
                    {conv.contact.avatar ? (
                      <Image
                        src={conv.contact.avatar}
                        alt={conv.contact.name}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {conv.contact.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {conv.unread && conv.unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground truncate">
                        {conv.contact.name}
                      </span>
                      {conv.timestamp && (
                        <span className="text-xs text-muted-foreground">{conv.timestamp}</span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                {activeConversation.contact.avatar ? (
                  <Image
                    src={activeConversation.contact.avatar}
                    alt={activeConversation.contact.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {activeConversation.contact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {activeConversation.contact.name}
                  </h3>
                  <span className="text-xs text-brand-success">Online</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onVideoCall && (
                  <button
                    type="button"
                    onClick={onVideoCall}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-[6px] transition-colors"
                    aria-label="Video call"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                )}
                {onCall && (
                  <button
                    type="button"
                    onClick={onCall}
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-[6px] transition-colors"
                    aria-label="Phone call"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn('flex gap-3', message.isOwn && 'flex-row-reverse')}
                >
                  {!message.isOwn &&
                    (message.sender.avatar ? (
                      <Image
                        src={message.sender.avatar}
                        alt={message.sender.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {message.sender.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    ))}
                  <div className={cn('max-w-[70%]', message.isOwn && 'text-right')}>
                    <div
                      className={cn(
                        'px-4 py-2 rounded-[10px] text-sm',
                        message.isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted text-foreground rounded-bl-none',
                      )}
                    >
                      {message.content}
                    </div>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, index) => (
                          <div
                            key={index}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2 rounded-[8px]',
                              message.isOwn ? 'bg-primary/10' : 'bg-muted',
                            )}
                          >
                            {attachment.type === 'file' ? (
                              <FileText className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="text-xs text-foreground">{attachment.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground mt-1 inline-block">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="px-6 py-4 border-t border-border">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-[6px] transition-colors"
                  aria-label="Attach file"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Message..."
                  className="flex-1 bg-muted border border-border rounded-[8px] px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!messageInput.trim()}
                  className="p-2 bg-primary text-primary-foreground rounded-[6px] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      {/* Contact Details Sidebar */}
      {activeConversation && (
        <div className="w-72 border-l border-border p-6">
          <div className="text-center mb-6">
            {activeConversation.contact.avatar ? (
              <Image
                src={activeConversation.contact.avatar}
                alt={activeConversation.contact.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-medium text-primary">
                  {activeConversation.contact.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <h3 className="text-base font-semibold text-foreground">
              {activeConversation.contact.name}
            </h3>
            {activeConversation.contact.company && (
              <p className="text-sm text-muted-foreground">{activeConversation.contact.company}</p>
            )}
          </div>

          <div className="space-y-4">
            {activeConversation.contact.email && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Email
                </h4>
                <p className="text-sm text-foreground">{activeConversation.contact.email}</p>
              </div>
            )}
            {activeConversation.contact.phone && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Phone
                </h4>
                <p className="text-sm text-foreground">{activeConversation.contact.phone}</p>
              </div>
            )}
            {activeConversation.contact.location && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Location
                </h4>
                <p className="text-sm text-foreground">{activeConversation.contact.location}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
