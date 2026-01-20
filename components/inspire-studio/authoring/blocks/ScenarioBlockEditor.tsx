import { Plus, X } from 'lucide-react';
import type { ScenarioBlock } from '@/lib/inspire-studio/types/contentBlocks';

interface ScenarioBlockEditorProps {
  block: ScenarioBlock;
  onChange: (content: ScenarioBlock['content']) => void;
}

export const ScenarioBlockEditor = ({
  block,
  onChange,
}: ScenarioBlockEditorProps): React.JSX.Element => {
  const addScene = (): void => {
    const newScene = {
      id: `scene_${Date.now()}`,
      text: '',
      choices: [{ id: `choice_${Date.now()}`, text: '', nextSceneId: '', feedback: '' }],
    };
    onChange({
      ...block.content,
      scenes: [...block.content.scenes, newScene],
    });
  };

  const removeScene = (id: string): void => {
    onChange({
      ...block.content,
      scenes: block.content.scenes.filter((scene) => scene.id !== id),
      startSceneId:
        block.content.startSceneId === id
          ? block.content.scenes[0]?.id
          : block.content.startSceneId,
    });
  };

  const updateScene = (id: string, field: string, value: unknown): void => {
    onChange({
      ...block.content,
      scenes: block.content.scenes.map((scene) =>
        scene.id === id ? { ...scene, [field]: value } : scene,
      ),
    });
  };

  const addChoice = (sceneId: string): void => {
    onChange({
      ...block.content,
      scenes: block.content.scenes.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              choices: [
                ...scene.choices,
                { id: `choice_${Date.now()}`, text: '', nextSceneId: '', feedback: '' },
              ],
            }
          : scene,
      ),
    });
  };

  const removeChoice = (sceneId: string, choiceId: string): void => {
    onChange({
      ...block.content,
      scenes: block.content.scenes.map((scene) =>
        scene.id === sceneId
          ? { ...scene, choices: scene.choices.filter((c) => c.id !== choiceId) }
          : scene,
      ),
    });
  };

  const updateChoice = (sceneId: string, choiceId: string, field: string, value: unknown): void => {
    onChange({
      ...block.content,
      scenes: block.content.scenes.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              choices: scene.choices.map((c) => (c.id === choiceId ? { ...c, [field]: value } : c)),
            }
          : scene,
      ),
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="scenario-title"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Scenario Title
        </label>
        <input
          id="scenario-title"
          type="text"
          value={block.content.title}
          onChange={(e) => onChange({ ...block.content, title: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Branching scenario title"
        />
      </div>
      <div>
        <label
          htmlFor="scenario-description"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Description
        </label>
        <textarea
          id="scenario-description"
          value={block.content.description}
          onChange={(e) => onChange({ ...block.content, description: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
          placeholder="Scenario description..."
        />
      </div>
      <div>
        <label
          htmlFor="scenario-start-scene"
          className="block text-sm font-medium text-brand-secondary mb-1"
        >
          Start Scene
        </label>
        <select
          id="scenario-start-scene"
          value={block.content.startSceneId}
          onChange={(e) => onChange({ ...block.content, startSceneId: e.target.value })}
          className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary"
        >
          {block.content.scenes.map((scene, idx) => (
            <option key={scene.id} value={scene.id}>
              Scene {idx + 1}: {scene.text.substring(0, 30) || 'Untitled'}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-3">
        <span className="block text-sm font-medium text-brand-secondary">Scenes</span>
        {block.content.scenes.map((scene, sceneIdx) => (
          <div key={scene.id} className="border-2 border-brand-strong rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-brand-primary">Scene {sceneIdx + 1}</span>
              {block.content.scenes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeScene(scene.id)}
                  aria-label={`Remove scene ${sceneIdx + 1}`}
                  className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
            <textarea
              value={scene.text}
              onChange={(e) => updateScene(scene.id, 'text', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-brand-primary text-sm"
              placeholder="Scene description..."
            />
            <div className="space-y-2">
              <span className="block text-xs font-medium text-brand-secondary">Choices</span>
              {scene.choices.map((choice, choiceIdx) => (
                <div
                  key={choice.id}
                  className="bg-brand-page border border-brand-default rounded p-2 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-brand-secondary">
                      Choice {choiceIdx + 1}
                    </span>
                    {scene.choices.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChoice(scene.id, choice.id)}
                        aria-label={`Remove choice ${choiceIdx + 1} from scene ${sceneIdx + 1}`}
                        className="ml-auto p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X className="w-3 h-3" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={choice.text}
                    onChange={(e) => updateChoice(scene.id, choice.id, 'text', e.target.value)}
                    className="w-full px-2 py-1 border border-brand-strong rounded text-sm"
                    placeholder="Choice text"
                  />
                  <select
                    value={choice.nextSceneId}
                    onChange={(e) =>
                      updateChoice(scene.id, choice.id, 'nextSceneId', e.target.value)
                    }
                    className="w-full px-2 py-1 border border-brand-strong rounded text-sm"
                  >
                    <option value="">End scenario</option>
                    {block.content.scenes.map((s, idx) => (
                      <option key={s.id} value={s.id}>
                        Go to Scene {idx + 1}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addChoice(scene.id)}
                className="flex items-center gap-2 px-3 py-1 text-brand-blue hover:bg-blue-50 rounded text-sm"
              >
                <Plus className="w-3 h-3" />
                Add Choice
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addScene}
          className="flex items-center gap-2 px-4 py-2 text-brand-blue hover:bg-blue-50 rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Scene
        </button>
      </div>
    </div>
  );
};
