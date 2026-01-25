'use client';

import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Loader2,
  Music,
  Upload,
  Video,
  Wand2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { GoogleCloudAI, type MediaGenerationResponse } from '@/lib/ai/google-cloud-ai';
import { logger } from '@/lib/logger';
import type { AISettings } from './AISettingsModal';

const log = logger.scope('MediaGeneratorPanel');

interface MediaGeneratorPanelProps {
  settings: AISettings;
  onMediaGenerated: (media: GeneratedMedia) => void;
}

export interface GeneratedMedia {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  altText?: string;
  transcript?: string;
  prompt: string;
  timestamp: Date;
}

export default function MediaGeneratorPanel({
  settings,
  onMediaGenerated,
}: MediaGeneratorPanelProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<'generate' | 'upload'>('generate');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio'>('image');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMedia, setGeneratedMedia] = useState<GeneratedMedia[]>([]);
  const [error, setError] = useState<string>('');

  const handleGenerate = async (): Promise<void> => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      let response: MediaGenerationResponse;

      switch (mediaType) {
        case 'image':
          response = await GoogleCloudAI.generateImage({
            type: 'image',
            prompt,
            settings: settings as unknown as Record<string, unknown>,
            options: { width: 1024, height: 1024 },
          });
          break;
        case 'video':
          response = await GoogleCloudAI.generateVideo({
            type: 'video',
            prompt,
            settings: settings as unknown as Record<string, unknown>,
            options: { duration: 30 },
          });
          break;
        case 'audio':
          response = await GoogleCloudAI.generateAudio({
            type: 'audio',
            prompt,
            settings: settings as unknown as Record<string, unknown>,
            options: { voice: 'en-US-Neural2-A' },
          });
          break;
      }

      if (response.success && response.url) {
        const media: GeneratedMedia = {
          id: Date.now().toString(),
          type: mediaType,
          url: response.url,
          altText: response.altText,
          transcript: response.transcript,
          prompt,
          timestamp: new Date(),
        };

        setGeneratedMedia([...generatedMedia, media]);
        onMediaGenerated(media);
        setPrompt('');
      } else {
        setError(response.error || 'Generation failed');
      }
    } catch (err) {
      setError('An error occurred during generation');
      log.error('Media generation failed', err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsGenerating(true);

    try {
      // Process document with Google Cloud Document AI
      const response = await GoogleCloudAI.processDocument({
        file,
        type: 'extract',
        settings: settings as unknown as Record<string, unknown>,
      });

      if (response.success) {
        // Handle extracted content
        const media: GeneratedMedia = {
          id: Date.now().toString(),
          type: 'document',
          url: URL.createObjectURL(file),
          prompt: `Uploaded: ${file.name}`,
          timestamp: new Date(),
        };

        setGeneratedMedia([...generatedMedia, media]);
        onMediaGenerated(media);
      }
    } catch (err) {
      setError('File upload processing failed');
      log.error(
        'File upload processing failed',
        err instanceof Error ? err : new Error(String(err)),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border-2 border-border p-6">
      <h3 className="text-xl font-bold text-foreground mb-4">Media Generator</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('generate')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'generate'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          AI Generate
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'upload'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {activeTab === 'generate' && (
        <div className="space-y-4">
          {/* Media Type Selection */}
          <div>
            <span className="block text-sm font-semibold text-foreground mb-2">Media Type</span>
            <fieldset className="grid grid-cols-3 gap-3">
              <legend className="sr-only">Media type selection</legend>
              {[
                { type: 'image' as const, icon: ImageIcon, label: 'Image' },
                { type: 'video' as const, icon: Video, label: 'Video' },
                { type: 'audio' as const, icon: Music, label: 'Audio/Narration' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => setMediaType(item.type)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      mediaType === item.type
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mx-auto mb-2 ${
                        mediaType === item.type ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                    <div className="text-sm font-medium text-center">{item.label}</div>
                  </button>
                );
              })}
            </fieldset>
          </div>

          {/* Prompt Input */}
          <div>
            <label
              htmlFor="media-prompt"
              className="block text-sm font-semibold text-foreground mb-2"
            >
              {mediaType === 'audio' ? 'Narration Text' : 'Generation Prompt'}
            </label>
            <textarea
              id="media-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-2 border-border rounded-lg focus:border-primary focus:outline-hidden bg-background text-foreground"
              placeholder={
                mediaType === 'image'
                  ? 'Describe the image you want to generate...'
                  : mediaType === 'video'
                    ? 'Describe the video scene or concept...'
                    : 'Enter the text to be converted to speech...'
              }
            />
          </div>

          {/* Safety Notice */}
          {settings.contentModeration.enabled && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-brand-primary p-3 rounded-r-lg">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-brand-blue dark:text-brand-cyan mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Content Safety Active</p>
                  <p className="text-muted-foreground">
                    All generated content will be automatically moderated
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border-l-4 border-brand-error p-3 rounded-r-lg">
              <div className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-brand-error mt-0.5" />
                <p className="text-foreground">{error}</p>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full px-6 py-3 bg-linear-to-r from-purple-600 to-blue-600 text-brand-primary rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating {mediaType}...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}
              </>
            )}
          </button>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground font-semibold mb-2">Upload Files</p>
            <p className="text-sm text-muted-foreground mb-4">
              Images, videos, audio, or documents (PDF, DOCX, PPTX)
            </p>
            <input
              type="file"
              onChange={handleFileUpload}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.ppt,.pptx"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 cursor-pointer transition-colors"
            >
              Choose Files
            </label>
          </div>

          {settings.accessibility.generateAltText && (
            <div className="bg-green-50 dark:bg-green-950/20 border-l-4 border-brand-success p-3 rounded-r-lg">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-brand-success mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Accessibility Features Enabled</p>
                  <p className="text-muted-foreground">
                    Alt text and transcripts will be automatically generated
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generated Media Library */}
      {generatedMedia.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-semibold text-foreground mb-3">
            Generated Media ({generatedMedia.length})
          </h4>
          <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
            {generatedMedia.map((media) => {
              const Icon =
                media.type === 'image'
                  ? ImageIcon
                  : media.type === 'video'
                    ? Video
                    : media.type === 'audio'
                      ? Music
                      : FileText;

              return (
                <motion.div
                  key={media.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-muted rounded-lg group relative"
                >
                  <div className="flex items-start gap-2">
                    <Icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{media.prompt}</p>
                      <p className="text-xs text-muted-foreground">
                        {media.timestamp.toLocaleTimeString()}
                      </p>
                      {media.altText && (
                        <p className="text-xs text-green-600 dark:text-brand-success mt-1">
                          ✓ Alt text generated
                        </p>
                      )}
                      {media.transcript && (
                        <p className="text-xs text-brand-blue dark:text-brand-cyan mt-1">
                          ✓ Transcript available
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-background rounded hover:bg-muted"
                    onClick={() =>
                      setGeneratedMedia(generatedMedia.filter((m) => m.id !== media.id))
                    }
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
