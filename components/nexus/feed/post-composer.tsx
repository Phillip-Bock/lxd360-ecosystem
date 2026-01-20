'use client';

/**
 * PostComposer Component
 * ======================
 * Create new posts for the LXD Nexus feed.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { AtSign, FileText, Hash, Image as ImageIcon, Link2, Smile, Video, X } from 'lucide-react';
import NextImage from 'next/image';
import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface PostComposerProps {
  userAvatar?: string;
  userName?: string;
  onSubmit?: (post: {
    content: string;
    images?: File[];
    tags?: string[];
    type?: 'post' | 'question' | 'portfolio';
  }) => void;
  placeholder?: string;
}

export function PostComposer({
  userAvatar,
  userName = 'User',
  onSubmit,
  placeholder = 'Share something with the community...',
}: PostComposerProps): React.JSX.Element {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [postType, setPostType] = useState<'post' | 'question' | 'portfolio'>('post');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (): void => {
    if (!content.trim()) return;

    const tags = content.match(/#(\w+)/g)?.map((tag) => tag.slice(1)) || [];

    onSubmit?.({
      content,
      images,
      tags,
      type: postType,
    });

    setContent('');
    setImages([]);
    setImagePreview([]);
    setIsExpanded(false);
    setPostType('post');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number): void => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-studio-bg border border-lxd-dark-surface-alt/50 rounded-xl p-4">
      <div className="flex gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-lxd-purple-light to-studio-accent shrink-0 flex items-center justify-center overflow-hidden">
          {userAvatar ? (
            <NextImage
              src={userAvatar}
              alt={userName}
              width={48}
              height={48}
              unoptimized
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-brand-primary font-semibold text-lg">{userName.charAt(0)}</span>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (!isExpanded && e.target.value.length > 0) {
                setIsExpanded(true);
              }
            }}
            onFocus={() => setIsExpanded(true)}
            placeholder={placeholder}
            rows={isExpanded ? 4 : 2}
            className="w-full bg-transparent text-brand-primary placeholder-gray-500 outline-hidden resize-none"
          />

          {/* Image Previews */}
          <AnimatePresence>
            {imagePreview.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mt-3"
              >
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <NextImage
                      src={preview}
                      alt={`Upload ${index + 1}`}
                      width={80}
                      height={80}
                      unoptimized
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-brand-error rounded-full flex items-center justify-center text-brand-primary hover:bg-brand-error transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Post Type Selector */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="flex gap-2">
                  {[
                    { type: 'post' as const, label: 'Post', icon: FileText },
                    { type: 'question' as const, label: 'Question', icon: Hash },
                    { type: 'portfolio' as const, label: 'Portfolio', icon: ImageIcon },
                  ].map((option) => {
                    const IconComponent = option.icon;
                    return (
                      <button
                        type="button"
                        key={option.type}
                        onClick={() => setPostType(option.type)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                          postType === option.type
                            ? 'bg-lxd-purple-light text-brand-primary'
                            : 'bg-lxd-dark-surface-alt/30 text-studio-text hover:bg-lxd-dark-surface-alt/50',
                        )}
                      >
                        <IconComponent className="w-4 h-4" />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-lxd-dark-surface-alt/50 mt-3">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-lxd-purple-light hover:bg-lxd-purple-light/10 rounded-lg transition-colors"
                title="Add image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-lxd-purple-light hover:bg-lxd-purple-light/10 rounded-lg transition-colors"
                title="Add video"
              >
                <Video className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-lxd-purple-light hover:bg-lxd-purple-light/10 rounded-lg transition-colors"
                title="Add link"
              >
                <Link2 className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-lxd-purple-light hover:bg-lxd-purple-light/10 rounded-lg transition-colors hidden sm:block"
                title="Add hashtag"
              >
                <Hash className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-lxd-purple-light hover:bg-lxd-purple-light/10 rounded-lg transition-colors hidden sm:block"
                title="Mention someone"
              >
                <AtSign className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 text-gray-500 hover:text-lxd-purple-light hover:bg-lxd-purple-light/10 rounded-lg transition-colors hidden sm:block"
                title="Add emoji"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {content.length > 0 && (
                <span
                  className={cn(
                    'text-xs',
                    content.length > 2000 ? 'text-brand-error' : 'text-gray-500',
                  )}
                >
                  {content.length}/2000
                </span>
              )}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!content.trim() || content.length > 2000}
                className="px-4 py-2 bg-lxd-purple-light hover:bg-lxd-purple-light text-brand-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
