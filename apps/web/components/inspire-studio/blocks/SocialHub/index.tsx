'use client';

import {
  BarChart2,
  Heart,
  MessageCircle,
  Pin,
  Plus,
  Send,
  ThumbsUp,
  User,
  Users,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type {
  BaseBlockProps,
  DiscussionThread,
  PollOption,
  SocialHubConfig,
  SocialHubContent,
} from '../types';

// ============================================================================
// DEFAULTS
// ============================================================================

const defaultConfig: SocialHubConfig = {
  allowAnonymous: false,
  moderationEnabled: true,
  maxCharacters: 500,
  requireApproval: false,
  notifyOnReply: true,
  showVotes: true,
  allowAttachments: false,
};

// ============================================================================
// COMPONENT
// ============================================================================

interface SocialHubBlockProps extends BaseBlockProps {
  content?: SocialHubContent;
  config?: SocialHubConfig;
}

/**
 * SocialHubBlock - Collaborative interaction block
 *
 * Features:
 * - Discussion threads
 * - Polls with live results
 * - Peer review activities
 * - Collaboration spaces
 */
export function SocialHubBlock({
  content,
  config = defaultConfig,
  isEditing = false,
  onContentChange,
  onConfigChange,
  className,
}: SocialHubBlockProps) {
  const [newMessage, setNewMessage] = useState('');
  const [selectedPollOption, setSelectedPollOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  const handleConfigChange = useCallback(
    (key: keyof SocialHubConfig, value: unknown) => {
      onConfigChange?.({ ...config, [key]: value });
    },
    [config, onConfigChange],
  );

  const handleContentChange = useCallback(
    (updates: Partial<SocialHubContent>) => {
      onContentChange?.({ ...content, ...updates });
    },
    [content, onContentChange],
  );

  const handleAddThread = useCallback(() => {
    if (!newMessage.trim()) return;

    const newThread: DiscussionThread = {
      id: uuidv4(),
      authorId: 'current-user',
      authorName: 'You',
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    handleContentChange({
      threads: [...(content?.threads ?? []), newThread],
    });
    setNewMessage('');
  }, [newMessage, content?.threads, handleContentChange]);

  const handleVote = useCallback(() => {
    if (!selectedPollOption || hasVoted) return;

    const updatedOptions = content?.pollOptions?.map((opt) =>
      opt.id === selectedPollOption ? { ...opt, votes: opt.votes + 1 } : opt,
    );

    handleContentChange({ pollOptions: updatedOptions });
    setHasVoted(true);
  }, [selectedPollOption, hasVoted, content?.pollOptions, handleContentChange]);

  const addPollOption = useCallback(() => {
    const newOption: PollOption = {
      id: uuidv4(),
      text: '',
      votes: 0,
    };
    handleContentChange({
      pollOptions: [...(content?.pollOptions ?? []), newOption],
    });
  }, [content?.pollOptions, handleContentChange]);

  const updatePollOption = useCallback(
    (index: number, text: string) => {
      if (!content?.pollOptions) return;
      const newOptions = [...content.pollOptions];
      newOptions[index] = { ...newOptions[index], text };
      handleContentChange({ pollOptions: newOptions });
    },
    [content?.pollOptions, handleContentChange],
  );

  const totalVotes = content?.pollOptions?.reduce((sum, opt) => sum + opt.votes, 0) ?? 0;

  // Render editing mode
  if (isEditing) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Content Type */}
        <div className="space-y-2">
          <Label className="text-xs">Interaction Type</Label>
          <Select
            value={content?.type ?? 'discussion'}
            onValueChange={(v) => handleContentChange({ type: v as SocialHubContent['type'] })}
          >
            <SelectTrigger className="h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-lxd-dark-surface border-lxd-dark-border">
              <SelectItem value="discussion">Discussion</SelectItem>
              <SelectItem value="poll">Poll</SelectItem>
              <SelectItem value="peer-review">Peer Review</SelectItem>
              <SelectItem value="collaboration">Collaboration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <Label className="text-xs">Title</Label>
          <Input
            value={content?.title ?? ''}
            onChange={(e) => handleContentChange({ title: e.target.value })}
            placeholder="Activity title..."
            className="h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Description/Instructions</Label>
          <Textarea
            value={content?.description ?? ''}
            onChange={(e) => handleContentChange({ description: e.target.value })}
            placeholder="Describe the activity..."
            className="min-h-[60px] bg-lxd-dark-bg border-lxd-dark-border"
          />
        </div>

        {/* Poll Options (if poll) */}
        {content?.type === 'poll' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Poll Question</Label>
            </div>
            <Input
              value={content?.pollQuestion ?? ''}
              onChange={(e) => handleContentChange({ pollQuestion: e.target.value })}
              placeholder="What is your question?"
              className="h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border"
            />

            <Label className="text-xs mt-4">Options</Label>
            <div className="space-y-2">
              {content?.pollOptions?.map((option, index) => (
                <Input
                  key={option.id}
                  value={option.text}
                  onChange={(e) => updatePollOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="h-8 text-xs bg-lxd-dark-bg border-lxd-dark-border"
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPollOption}
              className="mt-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Option
            </Button>
          </div>
        )}

        {/* Config Options */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-lxd-dark-border">
          <div className="flex items-center gap-2">
            <Switch
              checked={config.allowAnonymous ?? false}
              onCheckedChange={(v) => handleConfigChange('allowAnonymous', v)}
            />
            <Label className="text-xs">Allow Anonymous</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.moderationEnabled ?? true}
              onCheckedChange={(v) => handleConfigChange('moderationEnabled', v)}
            />
            <Label className="text-xs">Moderation</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.requireApproval ?? false}
              onCheckedChange={(v) => handleConfigChange('requireApproval', v)}
            />
            <Label className="text-xs">Require Approval</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={config.showVotes ?? true}
              onCheckedChange={(v) => handleConfigChange('showVotes', v)}
            />
            <Label className="text-xs">Show Votes</Label>
          </div>
        </div>

        {/* Max Characters */}
        <div className="space-y-2">
          <Label className="text-xs">Max Characters</Label>
          <Input
            type="number"
            min={50}
            max={2000}
            value={config.maxCharacters ?? 500}
            onChange={(e) => handleConfigChange('maxCharacters', Number(e.target.value))}
            className="h-8 w-32 text-xs bg-lxd-dark-bg border-lxd-dark-border"
          />
        </div>
      </div>
    );
  }

  // Render display mode
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      {content?.title && (
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg flex items-center gap-2">
            {content.type === 'discussion' && <MessageCircle className="h-5 w-5 text-lxd-purple" />}
            {content.type === 'poll' && <BarChart2 className="h-5 w-5 text-lxd-cyan" />}
            {content.type === 'peer-review' && <Users className="h-5 w-5 text-green-500" />}
            {content.type === 'collaboration' && <Users className="h-5 w-5 text-orange-500" />}
            {content.title}
          </h3>
        </div>
      )}

      {content?.description && (
        <p className="text-sm text-muted-foreground">{content.description}</p>
      )}

      {/* Discussion View */}
      {content?.type === 'discussion' && (
        <div className="space-y-4">
          {/* Thread List */}
          <ScrollArea className="h-64 rounded-lg border border-lxd-dark-border">
            <div className="p-4 space-y-4">
              {content?.threads?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Start the discussion!</p>
                </div>
              )}
              {content?.threads?.map((thread) => (
                <div
                  key={thread.id}
                  className={cn(
                    'p-3 rounded-lg bg-lxd-dark-bg border border-lxd-dark-border',
                    thread.isPinned && 'border-lxd-purple',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{thread.authorName}</span>
                        {thread.isPinned && <Pin className="h-3 w-3 text-lxd-purple" />}
                        <span className="text-xs text-muted-foreground">
                          {new Date(thread.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{thread.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-lxd-purple"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          {thread.likes ?? 0}
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-lxd-cyan"
                        >
                          <MessageCircle className="h-3 w-3" />
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* New Message Input */}
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value.slice(0, config.maxCharacters ?? 500))}
              placeholder="Share your thoughts..."
              className="flex-1 min-h-[60px] bg-lxd-dark-bg border-lxd-dark-border"
            />
            <Button
              type="button"
              onClick={handleAddThread}
              disabled={!newMessage.trim()}
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {newMessage.length}/{config.maxCharacters ?? 500}
          </p>
        </div>
      )}

      {/* Poll View */}
      {content?.type === 'poll' && (
        <div className="space-y-4">
          {content?.pollQuestion && <p className="font-medium text-lg">{content.pollQuestion}</p>}

          <div className="space-y-2">
            {content?.pollOptions?.map((option) => {
              const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
              const isSelected = selectedPollOption === option.id;

              return (
                <div
                  key={option.id}
                  className={cn(
                    'relative p-3 rounded-lg border transition-colors cursor-pointer',
                    hasVoted
                      ? 'bg-lxd-dark-bg border-lxd-dark-border'
                      : isSelected
                        ? 'bg-lxd-purple/10 border-lxd-purple'
                        : 'bg-lxd-dark-bg border-lxd-dark-border hover:border-lxd-purple/50',
                  )}
                  onClick={() => !hasVoted && setSelectedPollOption(option.id)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !hasVoted) {
                      e.preventDefault();
                      setSelectedPollOption(option.id);
                    }
                  }}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={hasVoted ? -1 : 0}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm">{option.text}</span>
                    {hasVoted && config.showVotes && (
                      <span className="text-sm font-medium">{percentage}%</span>
                    )}
                  </div>
                  {hasVoted && config.showVotes && (
                    <Progress value={percentage} className="h-1 mt-2" />
                  )}
                </div>
              );
            })}
          </div>

          {!hasVoted && (
            <Button
              type="button"
              onClick={handleVote}
              disabled={!selectedPollOption}
              className="w-full"
            >
              Submit Vote
            </Button>
          )}

          {hasVoted && (
            <p className="text-xs text-muted-foreground text-center">
              {totalVotes} total vote{totalVotes !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* Peer Review View */}
      {content?.type === 'peer-review' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-lxd-dark-bg border border-lxd-dark-border">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-pink-500" />
              <span className="font-medium">Peer Review Activity</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Review and provide feedback on peer submissions. Use the rubric criteria below to
              guide your feedback.
            </p>

            {content?.rubric && content.rubric.length > 0 && (
              <div className="mt-4 space-y-2">
                <Label className="text-xs">Rubric Criteria</Label>
                {content.rubric.map((criterion, index) => (
                  <div
                    key={index}
                    className="p-2 rounded bg-lxd-dark-surface border border-lxd-dark-border"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{criterion.criteria}</span>
                      <Badge variant="outline">{criterion.weight}%</Badge>
                    </div>
                    {criterion.description && (
                      <p className="text-xs text-muted-foreground mt-1">{criterion.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collaboration View */}
      {content?.type === 'collaboration' && (
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-lxd-dark-bg border border-lxd-dark-border">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-orange-500" />
              <span className="font-medium">Collaboration Space</span>
              <Badge variant="outline" className="text-green-400">
                Live
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Work together with your peers in real-time. Share ideas, documents, and collaborate on
              projects.
            </p>
            <div className="mt-4 p-8 border-2 border-dashed border-lxd-dark-border rounded-lg text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">
                Collaborative workspace - integration required
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SocialHubBlock;
