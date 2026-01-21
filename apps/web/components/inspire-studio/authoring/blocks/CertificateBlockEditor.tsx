import { Award, Calendar, CheckCircle, Download, User } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './BaseBlockEditor';

interface CertificateConfig {
  title: string;
  templateStyle: 'modern' | 'classic' | 'minimalist' | 'elegant';
  includeDate: boolean;
  includeSignature: boolean;
  signatureText: string;
  signatureTitle: string;
  includeScore: boolean;
  customMessage: string;
  downloadFormat: 'pdf' | 'png';
  requireAllBlocks: boolean;
  minimumScore: number;
}

type CertificateData = CertificateConfig;

export const CertificateBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as unknown as CertificateData) || {};
  const [config, setConfig] = useState<CertificateConfig>({
    title: data.title || 'Certificate of Completion',
    templateStyle: data.templateStyle || 'modern',
    includeDate: data.includeDate ?? true,
    includeSignature: data.includeSignature ?? true,
    signatureText: data.signatureText || 'Course Instructor',
    signatureTitle: data.signatureTitle || 'Lead Instructor',
    includeScore: data.includeScore ?? false,
    customMessage: data.customMessage || 'has successfully completed',
    downloadFormat: data.downloadFormat || 'pdf',
    requireAllBlocks: data.requireAllBlocks ?? true,
    minimumScore: data.minimumScore || 70,
  });

  const handleChange = (updates: Partial<CertificateConfig>): void => {
    const updated = { ...config, ...updates };
    setConfig(updated);
    props.onUpdate({ ...props.block, content: updated as Record<string, unknown> });
  };

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label
            htmlFor="certificate-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Certificate Title
          </label>
          <input
            id="certificate-title"
            type="text"
            value={config.title}
            onChange={(e) => handleChange({ title: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Certificate of Completion"
          />
        </div>

        {/* Template Style */}
        <div>
          <span className="block text-sm font-medium text-brand-secondary mb-3">
            Template Style
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleChange({ templateStyle: 'modern' })}
              className={`p-4 border-2 rounded-lg transition-all ${
                config.templateStyle === 'modern'
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-brand-default hover:border-brand-strong'
              }`}
            >
              <div className="font-medium">Modern</div>
              <div className="text-xs text-brand-muted">Clean, contemporary design</div>
            </button>
            <button
              type="button"
              onClick={() => handleChange({ templateStyle: 'classic' })}
              className={`p-4 border-2 rounded-lg transition-all ${
                config.templateStyle === 'classic'
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-brand-default hover:border-brand-strong'
              }`}
            >
              <div className="font-medium">Classic</div>
              <div className="text-xs text-brand-muted">Traditional certificate look</div>
            </button>
            <button
              type="button"
              onClick={() => handleChange({ templateStyle: 'minimalist' })}
              className={`p-4 border-2 rounded-lg transition-all ${
                config.templateStyle === 'minimalist'
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-brand-default hover:border-brand-strong'
              }`}
            >
              <div className="font-medium">Minimalist</div>
              <div className="text-xs text-brand-muted">Simple, elegant design</div>
            </button>
            <button
              type="button"
              onClick={() => handleChange({ templateStyle: 'elegant' })}
              className={`p-4 border-2 rounded-lg transition-all ${
                config.templateStyle === 'elegant'
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-brand-default hover:border-brand-strong'
              }`}
            >
              <div className="font-medium">Elegant</div>
              <div className="text-xs text-brand-muted">Sophisticated, formal style</div>
            </button>
          </div>
        </div>

        {/* Custom Message */}
        <div>
          <label
            htmlFor="completion-message"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Completion Message
          </label>
          <input
            id="completion-message"
            type="text"
            value={config.customMessage}
            onChange={(e) => handleChange({ customMessage: e.target.value })}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="has successfully completed"
          />
          <p className="text-xs text-brand-muted mt-1">
            This text appears between the learner&apos;s name and the course title
          </p>
        </div>

        {/* Certificate Elements */}
        <div>
          <span className="block text-sm font-medium text-brand-secondary mb-3">
            Include on Certificate
          </span>
          <div className="space-y-3">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={config.includeDate}
                onChange={(e) => handleChange({ includeDate: e.target.checked })}
                className="mt-1 text-amber-600 focus:ring-amber-500 rounded"
              />
              <div>
                <div className="font-medium text-brand-primary flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  Completion Date
                </div>
                <div className="text-sm text-brand-muted">
                  Show the date when course was completed
                </div>
              </div>
            </label>
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={config.includeSignature}
                onChange={(e) => handleChange({ includeSignature: e.target.checked })}
                className="mt-1 text-amber-600 focus:ring-amber-500 rounded"
              />
              <div>
                <div className="font-medium text-brand-primary flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-600" />
                  Instructor Signature
                </div>
                <div className="text-sm text-brand-muted">Add instructor name and title</div>
              </div>
            </label>
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={config.includeScore}
                onChange={(e) => handleChange({ includeScore: e.target.checked })}
                className="mt-1 text-amber-600 focus:ring-amber-500 rounded"
              />
              <div>
                <div className="font-medium text-brand-primary flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600" />
                  Final Score
                </div>
                <div className="text-sm text-brand-muted">
                  Display learner&apos;s overall course score
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Signature Details (conditional) */}
        {config.includeSignature && (
          <div className="border border-brand-default rounded-lg p-4 space-y-3">
            <div>
              <label
                htmlFor="signature-name"
                className="block text-sm font-medium text-brand-secondary mb-2"
              >
                Signature Name
              </label>
              <input
                id="signature-name"
                type="text"
                value={config.signatureText}
                onChange={(e) => handleChange({ signatureText: e.target.value })}
                className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Course Instructor"
              />
            </div>
            <div>
              <label
                htmlFor="signature-title"
                className="block text-sm font-medium text-brand-secondary mb-2"
              >
                Signature Title
              </label>
              <input
                id="signature-title"
                type="text"
                value={config.signatureTitle}
                onChange={(e) => handleChange({ signatureTitle: e.target.value })}
                className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Lead Instructor"
              />
            </div>
          </div>
        )}

        {/* Completion Requirements */}
        <div>
          <span className="block text-sm font-medium text-brand-secondary mb-3">
            Completion Requirements
          </span>
          <label className="flex items-start space-x-3 p-3 border border-brand-default rounded-lg">
            <input
              type="checkbox"
              checked={config.requireAllBlocks}
              onChange={(e) => handleChange({ requireAllBlocks: e.target.checked })}
              className="mt-1 text-amber-600 focus:ring-amber-500 rounded"
            />
            <div>
              <div className="font-medium text-brand-primary">Require All Blocks Completed</div>
              <div className="text-sm text-brand-muted">
                Learner must complete every block before certificate is generated
              </div>
            </div>
          </label>
        </div>

        {/* Minimum Score */}
        <div>
          <label
            htmlFor="minimum-score"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Minimum Score Required: {config.minimumScore}%
          </label>
          <input
            id="minimum-score"
            type="range"
            min="0"
            max="100"
            value={config.minimumScore}
            onChange={(e) => handleChange({ minimumScore: parseInt(e.target.value, 10) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-xs text-brand-muted mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className="text-sm text-brand-secondary mt-2">
            Learner must achieve at least this score on assessments to earn certificate
          </p>
        </div>

        {/* Download Format */}
        <div>
          <span className="block text-sm font-medium text-brand-secondary mb-2">
            Download Format
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleChange({ downloadFormat: 'pdf' })}
              className={`p-4 border-2 rounded-lg transition-all ${
                config.downloadFormat === 'pdf'
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-brand-default hover:border-brand-strong'
              }`}
            >
              <Download className="w-6 h-6 mx-auto mb-2 text-amber-600" />
              <div className="font-medium">PDF</div>
              <div className="text-xs text-brand-muted">Printable document</div>
            </button>
            <button
              type="button"
              onClick={() => handleChange({ downloadFormat: 'png' })}
              className={`p-4 border-2 rounded-lg transition-all ${
                config.downloadFormat === 'png'
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-brand-default hover:border-brand-strong'
              }`}
            >
              <Download className="w-6 h-6 mx-auto mb-2 text-amber-600" />
              <div className="font-medium">PNG</div>
              <div className="text-xs text-brand-muted">Image file</div>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-brand-secondary">
              <p className="font-medium text-amber-900 mb-1">Automatic Generation</p>
              <p>
                The certificate will be automatically generated and made available for download when
                the learner meets all completion requirements. The certificate is personalized with
                the learner&apos;s name and includes all selected elements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
