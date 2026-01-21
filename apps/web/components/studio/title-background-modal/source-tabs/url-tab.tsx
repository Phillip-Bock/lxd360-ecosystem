'use client';

import { CheckCircle, Link, RefreshCw, XCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { detectMediaType, type SourceTabProps } from '../types';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

export function UrlTab({ onSelect }: SourceTabProps) {
  const [url, setUrl] = useState('');
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const validateUrl = useCallback((inputUrl: string): boolean => {
    try {
      const parsed = new URL(inputUrl);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }, []);

  const handleLoadPreview = useCallback(async () => {
    if (!url.trim()) {
      setErrorMessage('Please enter a URL');
      setLoadState('error');
      return;
    }

    if (!validateUrl(url)) {
      setErrorMessage('Please enter a valid URL (http:// or https://)');
      setLoadState('error');
      return;
    }

    setLoadState('loading');
    setErrorMessage(null);

    // For images, we can check if the URL is accessible by loading an image
    const mediaType = detectMediaType(url);

    if (mediaType === 'image' || mediaType === 'gif') {
      // Test if image loads
      const img = new Image();
      img.onload = () => {
        setLoadState('success');
        onSelect(url, {
          sourceType: 'url',
          type: mediaType,
        });
      };
      img.onerror = () => {
        setLoadState('error');
        setErrorMessage('Could not load image from URL');
      };
      img.src = url;
    } else if (mediaType === 'video') {
      // For video, we'll just accept it (actual validation would require server-side)
      setLoadState('success');
      onSelect(url, {
        sourceType: 'url',
        type: 'video',
      });
    } else {
      // Unknown type - try as image first
      const img = new Image();
      img.onload = () => {
        setLoadState('success');
        onSelect(url, {
          sourceType: 'url',
          type: 'image',
        });
      };
      img.onerror = () => {
        setLoadState('error');
        setErrorMessage(
          'Could not determine media type. Please ensure URL points to an image or video.',
        );
      };
      img.src = url;
    }
  }, [url, validateUrl, onSelect]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleLoadPreview();
      }
    },
    [handleLoadPreview],
  );

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(e.target.value);
      // Reset state when URL changes
      if (loadState !== 'idle') {
        setLoadState('idle');
        setErrorMessage(null);
      }
    },
    [loadState],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Enter a URL to an image or video</p>

      {/* URL Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={url}
            onChange={handleUrlChange}
            onKeyDown={handleKeyDown}
            className="pl-9"
            aria-invalid={loadState === 'error'}
          />
        </div>
        <Button onClick={handleLoadPreview} disabled={loadState === 'loading'} variant="outline">
          {loadState === 'loading' ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Load'}
        </Button>
      </div>

      {/* Status indicators */}
      {loadState === 'success' && (
        <div className="flex items-center gap-2 text-sm text-green-500">
          <CheckCircle className="h-4 w-4" />
          <span>URL validated successfully</span>
        </div>
      )}

      {loadState === 'error' && errorMessage && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <XCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Helper text */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Supported formats: JPG, PNG, WebP, GIF, MP4, WebM</p>
        <p>Make sure the URL is publicly accessible</p>
      </div>
    </div>
  );
}
