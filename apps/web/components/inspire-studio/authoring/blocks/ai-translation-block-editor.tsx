import { Check, Globe, Languages, Loader } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface Translation {
  language: string;
  languageName: string;
  text: string;
}

interface AITranslationData {
  sourceText?: string;
  sourceLanguage?: string;
  translations?: Translation[];
}

export const AITranslationBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as unknown as AITranslationData) || {};
  const [sourceText, setSourceText] = useState(data.sourceText || '');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  // TODO(LXD-301): setTranslations will be used after Firestore migration
  const [translations] = useState<Translation[]>(data.translations || []);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState('');

  const languages = [
    { code: 'es', name: 'Spanish (Español)' },
    { code: 'fr', name: 'French (Français)' },
    { code: 'de', name: 'German (Deutsch)' },
    { code: 'zh', name: 'Chinese (中文)' },
    { code: 'ja', name: 'Japanese (日本語)' },
    { code: 'ko', name: 'Korean (한국어)' },
    { code: 'it', name: 'Italian (Italiano)' },
    { code: 'pt', name: 'Portuguese (Português)' },
    { code: 'ar', name: 'Arabic (العربية)' },
    { code: 'hi', name: 'Hindi (हिन्दी)' },
    { code: 'ru', name: 'Russian (Русский)' },
    { code: 'nl', name: 'Dutch (Nederlands)' },
  ];

  const toggleLanguage = (code: string): void => {
    if (selectedLanguages.includes(code)) {
      setSelectedLanguages(selectedLanguages.filter((l) => l !== code));
    } else {
      setSelectedLanguages([...selectedLanguages, code]);
    }
  };

  const handleTranslate = async (): Promise<void> => {
    if (!sourceText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    if (selectedLanguages.length === 0) {
      setError('Please select at least one target language');
      return;
    }

    setIsTranslating(true);
    setError('');

    try {
      // TODO(LXD-301): Implement Cloud Functions AI translation
      setError('AI translation temporarily unavailable during Firebase migration');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to translate content');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
            <Languages className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Real-Time Translation</h3>
        </div>

        <div>
          <label
            htmlFor="translation-source"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Source Text
          </label>
          <textarea
            id="translation-source"
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Enter text to translate..."
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            rows={6}
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-brand-secondary mb-2">
            Translate to (select multiple):
          </legend>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border border-brand-default rounded-lg">
            {languages.map((lang) => (
              <label
                key={lang.code}
                className="flex items-center gap-2 p-2 hover:bg-brand-page rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes(lang.code)}
                  onChange={() => toggleLanguage(lang.code)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <span className="text-sm text-brand-secondary">{lang.name}</span>
              </label>
            ))}
          </div>
          {selectedLanguages.length > 0 && (
            <p className="mt-2 text-sm text-brand-secondary">
              {selectedLanguages.length} language{selectedLanguages.length > 1 ? 's' : ''} selected
            </p>
          )}
        </fieldset>

        <button
          type="button"
          onClick={handleTranslate}
          disabled={isTranslating || !sourceText.trim() || selectedLanguages.length === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-linear-to-r from-green-600 to-teal-600 text-brand-primary rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isTranslating ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Translating... ({selectedLanguages.length} language
              {selectedLanguages.length > 1 ? 's' : ''})
            </>
          ) : (
            <>
              <Globe className="w-5 h-5" />
              Translate Content
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {translations.length > 0 && (
          <div className="border-t pt-4 space-y-3">
            <span className="block text-sm font-medium text-brand-secondary">
              Translations ({translations.length})
            </span>

            <div className="space-y-3">
              {translations.map((translation, idx) => (
                <div key={idx} className="p-4 bg-brand-page border border-brand-default rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-brand-primary">
                      {translation.languageName}
                    </span>
                    <Check className="w-4 h-4 text-green-600 ml-auto" />
                  </div>
                  <p className="text-brand-secondary whitespace-pre-wrap">{translation.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseBlockEditor>
  );
};
