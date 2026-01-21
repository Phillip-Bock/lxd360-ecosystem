'use client';

/**
 * PostCard Component
 * ==================
 * Social media style post card for the LXD Nexus feed.
 */

import { motion } from 'framer-motion';
import {
  Bookmark,
  CheckCircle,
  ExternalLink,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Star,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface PostAuthor {
  id: string;
  name: string;
  title?: string;
  avatar?: string;
  isVerified?: boolean;
  isMentor?: boolean;
  username?: string;
}

export interface PostData {
  id: string;
  author: PostAuthor;
  content: string;
  timestamp: string;
  image?: string;
  tags?: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  isQuestion?: boolean;
  isPortfolio?: boolean;
  portfolioTitle?: string;
  link?: {
    url: string;
    title: string;
    description?: string;
    image?: string;
  };
}

interface PostCardProps {
  post: PostData;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
}

export function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onBookmark,
}: PostCardProps): React.JSX.Element {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = (): void => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    onLike?.(post.id);
  };

  const handleBookmark = (): void => {
    setIsBookmarked(!isBookmarked);
    onBookmark?.(post.id);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl overflow-hidden hover:border-lxd-dark-surface-alt transition-colors"
    >
      {/* Header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex gap-3">
          <Link href={`/nexus/members/${post.author.username || post.author.id}`}>
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-lxd-purple-light to-studio-accent flex items-center justify-center overflow-hidden">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={48}
                    height={48}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-brand-primary font-semibold text-lg">
                    {post.author.name.charAt(0)}
                  </span>
                )}
              </div>
              {post.author.isMentor && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] border-2 border-studio-bg">
                  <Star className="w-3 h-3 text-brand-primary fill-white" />
                </span>
              )}
            </div>
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/nexus/members/${post.author.username || post.author.id}`}
                className="font-medium text-brand-primary hover:underline"
              >
                {post.author.name}
              </Link>
              {post.author.isVerified && (
                <span
                  className="w-4 h-4 bg-studio-accent rounded-full flex items-center justify-center"
                  title="Verified"
                >
                  <CheckCircle className="w-2.5 h-2.5 text-brand-primary" />
                </span>
              )}
              {post.author.isMentor && (
                <span className="px-2 py-0.5 bg-brand-warning/10 text-brand-warning text-xs rounded-full font-medium">
                  Mentor
                </span>
              )}
            </div>
            {post.author.title && <p className="text-sm text-gray-500">{post.author.title}</p>}
            <p className="text-xs text-gray-500">{post.timestamp}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-brand-primary hover:bg-lxd-dark-surface-alt/50 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Copy link</DropdownMenuItem>
            <DropdownMenuItem>Report post</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Mute {post.author.name}</DropdownMenuItem>
            <DropdownMenuItem>Block {post.author.name}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {post.isQuestion && (
          <span className="inline-flex items-center gap-1 mb-2 px-2 py-1 bg-studio-accent/10 text-studio-accent text-xs rounded-full font-medium">
            <MessageCircle className="w-3 h-3" />
            Question
          </span>
        )}
        {post.isPortfolio && (
          <span className="inline-flex items-center gap-1 mb-2 px-2 py-1 bg-lxd-purple-light/10 text-lxd-purple-light text-xs rounded-full font-medium">
            <ExternalLink className="w-3 h-3" />
            Portfolio
          </span>
        )}
        <p className="text-studio-text whitespace-pre-line leading-relaxed">{post.content}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/nexus/feed?tag=${tag}`}
                className="text-studio-accent text-sm hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Image */}
      {post.image && (
        <div className="px-4 pb-4">
          <div className="relative aspect-video bg-lxd-dark-surface-alt/30 rounded-lg overflow-hidden">
            <Image
              src={post.image}
              alt="Post image"
              width={800}
              height={450}
              unoptimized
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Link Preview */}
      {post.link && (
        <div className="mx-4 mb-4">
          <a
            href={post.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block border border-lxd-dark-surface-alt/50 rounded-lg overflow-hidden hover:border-lxd-purple-light/50 transition-colors"
          >
            {post.link.image && (
              <div className="aspect-video bg-lxd-dark-surface-alt/30">
                <Image
                  src={post.link.image}
                  alt={post.link.title}
                  width={800}
                  height={450}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-3 bg-studio-bg-dark">
              <h4 className="font-medium text-brand-primary text-sm mb-1 line-clamp-1">
                {post.link.title}
              </h4>
              {post.link.description && (
                <p className="text-xs text-gray-500 line-clamp-2">{post.link.description}</p>
              )}
            </div>
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-lxd-dark-surface-alt/50 flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-6">
          <button
            type="button"
            onClick={handleLike}
            className={cn(
              'flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg transition-colors',
              isLiked
                ? 'text-brand-error'
                : 'text-gray-500 hover:text-brand-error hover:bg-red-400/10',
            )}
          >
            <Heart className={cn('w-5 h-5', isLiked && 'fill-red-400')} />
            <span className="text-sm">{likesCount}</span>
          </button>
          <button
            type="button"
            onClick={() => onComment?.(post.id)}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-gray-500 hover:text-studio-accent hover:bg-studio-accent/10 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{post.comments}</span>
          </button>
          <button
            type="button"
            onClick={() => onShare?.(post.id)}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg text-gray-500 hover:text-block-data hover:bg-block-data/10 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm hidden sm:inline">{post.shares}</span>
          </button>
        </div>
        <button
          type="button"
          onClick={handleBookmark}
          className={cn(
            'p-2 rounded-lg transition-colors',
            isBookmarked
              ? 'text-brand-warning'
              : 'text-gray-500 hover:text-brand-warning hover:bg-amber-400/10',
          )}
        >
          <Bookmark className={cn('w-5 h-5', isBookmarked && 'fill-amber-400')} />
        </button>
      </div>
    </motion.article>
  );
}
