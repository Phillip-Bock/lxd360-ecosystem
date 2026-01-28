import { Loader, Mic, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface AINarrationData {
  text?: string;
  voiceId?: string;
  voiceName?: string;
  language?: string;
  audioUrl?: string;
}

export const AINarrationBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as unknown as AINarrationData) || {};
  const [text, setText] = useState(data.text || '');
  const [voiceId, setVoiceId] = useState(data.voiceId || 'alloy');
  const [language, setLanguage] = useState(data.language || 'en-US');
  // TODO(LXD-301): setAudioUrl will be used after Firestore migration
  const [audioUrl] = useState(data.audioUrl || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const voices = [
    { id: 'alloy', name: 'Alloy (Professional)', gender: 'Neutral' },
    { id: 'echo', name: 'Echo (Warm)', gender: 'Male' },
    { id: 'fable', name: 'Fable (Clear)', gender: 'Female' },
    { id: 'onyx', name: 'Onyx (Deep)', gender: 'Male' },
    { id: 'nova', name: 'Nova (Friendly)', gender: 'Female' },
    { id: 'shimmer', name: 'Shimmer (Energetic)', gender: 'Female' },
  ];

  const handleGenerate = async (): Promise<void> => {
    if (!text.trim()) {
      setError('Please enter text to narrate');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // TODO(LXD-301): Implement Cloud Functions AI narration
      setError('AI narration generation temporarily unavailable during Firebase migration');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate narration');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
            <Mic className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">AI Narration Generator</h3>
        </div>

        <div>
          <label
            htmlFor="narration-text"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Text to Narrate
          </label>
          <textarea
            id="narration-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter the text you want to convert to speech..."
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
            rows={6}
          />
          <p className="mt-1 text-xs text-brand-muted">
            Word count: {text.split(/\s+/).filter((w) => w).length}
          </p>
        </div>

        <div>
          <label
            htmlFor="narration-voice"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Voice
          </label>
          <select
            id="narration-voice"
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {voices.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name} - {voice.gender}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="narration-language"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Language
          </label>
          <select
            id="narration-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            <option value="it-IT">Italian</option>
            <option value="pt-BR">Portuguese (Brazil)</option>
            <option value="zh-CN">Chinese (Mandarin)</option>
            <option value="ja-JP">Japanese</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !text.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-pink-600 to-rose-600 text-brand-primary rounded-lg hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Generating Narration...
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              Generate Narration
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {audioUrl && (
          <div className="border-t pt-4">
            <span className="block text-sm font-medium text-brand-secondary mb-2">Preview</span>
            <div className="p-4 bg-brand-page border border-brand-default rounded-lg">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-brand-muted" />
                <audio controls src={audioUrl} className="flex-1">
                  <track kind="captions" srcLang="en" label="English captions" />
                  Your browser does not support audio playback.
                </audio>
              </div>
              <p className="mt-2 text-xs text-brand-muted">
                Note: Text-to-speech service requires API configuration
              </p>
            </div>
          </div>
        )}
      </div>
    </BaseBlockEditor>
  );
};
