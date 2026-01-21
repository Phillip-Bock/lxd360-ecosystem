import { Lock, Users2 } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './BaseBlockEditor';

interface TeamChallengeData {
  title?: string;
  instructions?: string;
  challengeType?: string;
  teamSize?: number;
}

export const TeamChallengeBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as TeamChallengeData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [instructions, setInstructions] = useState(data.instructions || '');
  const [challengeType, setChallengeType] = useState(data.challengeType || 'puzzle');
  const [teamSize, setTeamSize] = useState(data.teamSize || 4);

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Users2 className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Team-Based Challenge</h3>
          <span className="ml-auto px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full font-medium">
            Social
          </span>
        </div>
        <div>
          <label
            htmlFor="team-challenge-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Challenge Title
          </label>
          <input
            id="team-challenge-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, title: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="e.g., Design Thinking Challenge"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <div>
          <label
            htmlFor="team-challenge-instructions"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Instructions
          </label>
          <textarea
            id="team-challenge-instructions"
            value={instructions}
            onChange={(e) => {
              setInstructions(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, instructions: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="Describe the team challenge..."
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-orange-500 resize-none"
            rows={4}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="team-challenge-type"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Challenge Type
            </label>
            <select
              id="team-challenge-type"
              value={challengeType}
              onChange={(e) => {
                setChallengeType(e.target.value);
                props.onUpdate({
                  ...props.block,
                  content: { ...data, challengeType: e.target.value } as Record<string, unknown>,
                });
              }}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="puzzle">Group Puzzle</option>
              <option value="problem_solving">Problem Solving</option>
              <option value="creative_task">Creative Task</option>
              <option value="case_study">Case Study</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="team-challenge-size"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Team Size
            </label>
            <input
              id="team-challenge-size"
              type="number"
              value={teamSize}
              onChange={(e) => {
                setTeamSize(parseInt(e.target.value, 10));
                props.onUpdate({
                  ...props.block,
                  content: { ...data, teamSize: parseInt(e.target.value, 10) } as Record<
                    string,
                    unknown
                  >,
                });
              }}
              min="2"
              max="10"
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-2 text-xs text-orange-800">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Team Collaboration Required</p>
              <p>
                Challenge remains locked until all {teamSize} team members participate. Individual
                contributions are tracked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
