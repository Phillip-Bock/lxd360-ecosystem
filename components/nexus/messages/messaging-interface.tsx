'use client';

/**
 * Messaging Interface
 * ====================
 * Real-time chat interface with conversation list and message thread.
 */

import { motion } from 'framer-motion';
import {
  Check,
  CheckCheck,
  ChevronLeft,
  Image,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// Mock conversation data
const MOCK_CONVERSATIONS = [
  {
    id: '1',
    user: {
      id: 'u1',
      name: 'Sarah Chen',
      avatar: 'https://i.pravatar.cc/150?u=sarah',
      title: 'Staff Engineer at Google',
      isOnline: true,
    },
    lastMessage: {
      content: 'Great progress on the React hooks exercise!',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
    },
    unreadCount: 2,
  },
  {
    id: '2',
    user: {
      id: 'u2',
      name: 'Marcus Johnson',
      avatar: 'https://i.pravatar.cc/150?u=marcus',
      title: 'Tech Lead at Netflix',
      isOnline: false,
    },
    lastMessage: {
      content: 'Let me know when you want to schedule our next session',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      isRead: true,
    },
    unreadCount: 0,
  },
  {
    id: '3',
    user: {
      id: 'u3',
      name: 'Emily Zhang',
      avatar: 'https://i.pravatar.cc/150?u=emily',
      title: 'Senior PM at Meta',
      isOnline: true,
    },
    lastMessage: {
      content: 'Here are some resources for your PM transition',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isRead: true,
    },
    unreadCount: 0,
  },
];

const MOCK_MESSAGES = [
  {
    id: '1',
    senderId: 'u1',
    content: 'Hey! How are you doing with the React hooks exercise I assigned?',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '2',
    senderId: 'me',
    content: "Hi Sarah! I've been working on it. I got stuck on the custom hook for data fetching.",
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '3',
    senderId: 'u1',
    content:
      "That's a common challenge! Let me share some tips:\n\n1. Start with useEffect for the fetch logic\n2. Use useState for loading and error states\n3. Consider using a cleanup function\n\nWant me to review your code?",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '4',
    senderId: 'me',
    content: "That would be amazing! I'll push my code to the repo and share the link.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: true,
  },
  {
    id: '5',
    senderId: 'u1',
    content: 'Perfect! Take your time. We can also go through it in our next session.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    isRead: true,
  },
  {
    id: '6',
    senderId: 'u1',
    content: 'Great progress on the React hooks exercise!',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
  },
];

interface MessagingInterfaceProps {
  userId: string;
}

export function MessagingInterface({ userId }: MessagingInterfaceProps): React.JSX.Element {
  void userId; // Will be used when integrating real data
  const [selectedConversation, setSelectedConversation] = useState(MOCK_CONVERSATIONS[0]);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileConversationOpen, setIsMobileConversationOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Wrapped in useCallback to prevent recreation on every render
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      senderId: 'me',
      content: newMessage,
      timestamp: new Date(),
      isRead: false,
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate reply
    setTimeout(() => {
      const reply = {
        id: (Date.now() + 1).toString(),
        senderId: selectedConversation.user.id,
        content: 'Thanks for the update! Let me review that and get back to you.',
        timestamp: new Date(),
        isRead: false,
      };
      setMessages((prev) => [...prev, reply]);
    }, 2000);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredConversations = MOCK_CONVERSATIONS.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="h-[calc(100vh-180px)] flex rounded-xl border border-brand-default dark:border-brand-default bg-brand-surface dark:bg-brand-page overflow-hidden">
      {/* Conversation List */}
      <div
        className={cn(
          'w-full md:w-80 shrink-0 border-r border-brand-default dark:border-brand-default flex flex-col',
          isMobileConversationOpen && 'hidden md:flex',
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-brand-default dark:border-brand-default">
          <h2 className="text-lg font-semibold text-brand-primary dark:text-brand-primary mb-3">
            Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          {filteredConversations.map((conversation) => (
            <button
              type="button"
              key={conversation.id}
              onClick={() => {
                setSelectedConversation(conversation);
                setIsMobileConversationOpen(true);
              }}
              className={cn(
                'w-full p-4 flex items-start gap-3 hover:bg-brand-page dark:hover:bg-brand-surface/50 transition-colors border-b border-slate-100 dark:border-brand-subtle',
                selectedConversation.id === conversation.id &&
                  'bg-brand-page dark:bg-brand-surface/50',
              )}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conversation.user.avatar} />
                  <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                </Avatar>
                {conversation.user.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-brand-success rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-brand-primary dark:text-brand-primary truncate">
                    {conversation.user.name}
                  </h3>
                  <span className="text-xs text-brand-muted">
                    {formatTime(conversation.lastMessage.timestamp)}
                  </span>
                </div>
                <p
                  className={cn(
                    'text-sm truncate',
                    conversation.unreadCount > 0
                      ? 'text-brand-primary dark:text-brand-primary font-medium'
                      : 'text-brand-muted',
                  )}
                >
                  {conversation.lastMessage.content}
                </p>
              </div>
              {conversation.unreadCount > 0 && (
                <Badge className="bg-brand-primary text-brand-primary min-w-[20px] h-5 px-1.5 text-xs">
                  {conversation.unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Message Thread */}
      <div className={cn('flex-1 flex flex-col', !isMobileConversationOpen && 'hidden md:flex')}>
        {/* Conversation Header */}
        <div className="p-4 border-b border-brand-default dark:border-brand-default flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileConversationOpen(false)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedConversation.user.avatar} />
                <AvatarFallback>{selectedConversation.user.name[0]}</AvatarFallback>
              </Avatar>
              {selectedConversation.user.isOnline && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-brand-success rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-brand-primary dark:text-brand-primary">
                {selectedConversation.user.name}
              </h3>
              <p className="text-xs text-brand-muted">
                {selectedConversation.user.isOnline ? 'Online' : 'Last seen 2h ago'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon">
              <Phone className="w-5 h-5 text-brand-muted" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="w-5 h-5 text-brand-muted" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5 text-brand-muted" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Schedule Session</DropdownMenuItem>
                <DropdownMenuItem>Search Messages</DropdownMenuItem>
                <DropdownMenuItem className="text-brand-error">Block User</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {/* Date Separator */}
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-slate-200 dark:bg-brand-surface-hover" />
              <span className="text-xs text-brand-muted">Today</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-brand-surface-hover" />
            </div>

            {messages.map((message, index) => {
              const isMe = message.senderId === 'me';
              const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('flex gap-2', isMe && 'flex-row-reverse')}
                >
                  {!isMe && showAvatar ? (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={selectedConversation.user.avatar} />
                      <AvatarFallback>{selectedConversation.user.name[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8" />
                  )}
                  <div className={cn('max-w-[70%] group', isMe && 'items-end')}>
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2',
                        isMe
                          ? 'bg-brand-primary text-brand-primary rounded-br-md'
                          : 'bg-brand-surface dark:bg-brand-surface text-brand-primary dark:text-brand-primary rounded-bl-md',
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div
                      className={cn(
                        'flex items-center gap-1 mt-1 text-xs text-brand-muted',
                        isMe && 'justify-end',
                      )}
                    >
                      <span>{formatTime(message.timestamp)}</span>
                      {isMe &&
                        (message.isRead ? (
                          <CheckCheck className="w-4 h-4 text-brand-blue" />
                        ) : (
                          <Check className="w-4 h-4" />
                        ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-brand-default dark:border-brand-default">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex gap-1">
              <Button type="button" variant="ghost" size="icon" className="text-brand-muted">
                <Paperclip className="w-5 h-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-brand-muted"
                aria-label="Add image"
              >
                <Image className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-brand-muted"
              >
                <Smile className="w-5 h-5" />
              </Button>
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!newMessage.trim()}
              className="bg-brand-primary hover:bg-brand-primary-hover"
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
