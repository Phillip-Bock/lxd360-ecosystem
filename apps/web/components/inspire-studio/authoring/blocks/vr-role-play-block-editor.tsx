import { Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface AICharacter {
  id: string;
  name: string;
  role: string;
  personality: string;
}

interface VRRolePlayContent {
  title?: string;
  scenarioType?: string;
  aiCharacters?: AICharacter[];
  [key: string]: unknown;
}

export const VRRolePlayBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content || {}) as VRRolePlayContent;
  const [title, setTitle] = useState(data.title || '');
  const [scenarioType, setScenarioType] = useState(data.scenarioType || 'presentation');
  const [characters, setCharacters] = useState<AICharacter[]>(data.aiCharacters || []);

  const addCharacter = (): void => {
    const newChar = { id: `char_${Date.now()}`, name: '', role: '', personality: '' };
    const updated = [...characters, newChar];
    setCharacters(updated);
    props.onUpdate({ ...props.block, content: { ...data, aiCharacters: updated } });
  };

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">VR Role-Play Scenario</h3>
          <span className="ml-auto px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full font-medium">
            VR+AI
          </span>
        </div>
        <div>
          <label
            htmlFor="vr-roleplay-scenario-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Scenario Title
          </label>
          <input
            id="vr-roleplay-scenario-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({ ...props.block, content: { ...data, title: e.target.value } });
            }}
            placeholder="e.g., Difficult Customer Conversation"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label
            htmlFor="vr-roleplay-scenario-type"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Scenario Type
          </label>
          <select
            id="vr-roleplay-scenario-type"
            value={scenarioType}
            onChange={(e) => {
              setScenarioType(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, scenarioType: e.target.value },
              });
            }}
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="presentation">Presentation Skills</option>
            <option value="conflict_resolution">Conflict Resolution</option>
            <option value="sales_pitch">Sales Pitch</option>
            <option value="interview">Job Interview</option>
            <option value="customer_service">Customer Service</option>
            <option value="leadership">Leadership Scenario</option>
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="block text-sm font-medium text-brand-secondary">
              AI Characters ({characters.length})
            </span>
            <button
              type="button"
              onClick={addCharacter}
              className="flex items-center gap-1 px-3 py-1 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Character
            </button>
          </div>
          <div className="space-y-2">
            {characters.map((char, idx) => (
              <div
                key={char.id}
                className="p-3 bg-brand-page border border-brand-default rounded-lg"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => {
                      const updated = [...characters];
                      updated[idx].name = e.target.value;
                      setCharacters(updated);
                      props.onUpdate({
                        ...props.block,
                        content: { ...data, aiCharacters: updated },
                      });
                    }}
                    placeholder="Character name"
                    className="flex-1 px-2 py-1 text-sm border border-brand-strong rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = characters.filter((_, i) => i !== idx);
                      setCharacters(updated);
                      props.onUpdate({
                        ...props.block,
                        content: { ...data, aiCharacters: updated },
                      });
                    }}
                    className="p-1 text-brand-muted hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
