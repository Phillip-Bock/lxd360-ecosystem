import { Code2, Play } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface CodeValidatorData {
  title?: string;
  language?: string;
  starterCode?: string;
}

export const CodeValidatorBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as CodeValidatorData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [language, setLanguage] = useState(data.language || 'python');
  const [starterCode, setStarterCode] = useState(data.starterCode || '');

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-slate-700 to-gray-900 rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Code Validator</h3>
          <span className="ml-auto px-2 py-1 bg-brand-surface text-brand-secondary text-xs rounded-full font-medium">
            Assessment
          </span>
        </div>
        <div className="p-3 bg-brand-page border border-brand-default rounded-lg text-xs">
          <p className="font-medium mb-1">Code execution and validation</p>
          <p>
            Supported: HTML, SQL, Python. Real-time execution, output verification, syntax checking
          </p>
        </div>
        <div>
          <label
            htmlFor="code-validator-exercise-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Exercise Title
          </label>
          <input
            id="code-validator-exercise-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, title: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="e.g., Write a Function to Calculate..."
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-slate-500"
          />
        </div>
        <div>
          <label
            htmlFor="code-validator-language"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Programming Language
          </label>
          <select
            id="code-validator-language"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, language: e.target.value } as Record<string, unknown>,
              });
            }}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-slate-500"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="html">HTML</option>
            <option value="sql">SQL</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="code-validator-starter-code"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Starter Code (Optional)
          </label>
          <textarea
            id="code-validator-starter-code"
            value={starterCode}
            onChange={(e) => {
              setStarterCode(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, starterCode: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="def calculate():\n    # Your code here\n    pass"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-slate-500 resize-none font-mono text-sm"
            rows={6}
          />
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2 text-xs text-blue-800">
            <Play className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Validation Features:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Real-time syntax checking</li>
                <li>Test case execution</li>
                <li>Output comparison</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
