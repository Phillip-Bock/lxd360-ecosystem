import { Award, TrendingUp, Trophy } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './BaseBlockEditor';

interface GamificationHubData {
  title?: string;
  pointsEnabled?: boolean;
  badgesEnabled?: boolean;
  leaderboardEnabled?: boolean;
}

export const GamificationHubBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as GamificationHubData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [pointsEnabled, setPointsEnabled] = useState(data.pointsEnabled ?? true);
  const [badgesEnabled, setBadgesEnabled] = useState(data.badgesEnabled ?? true);
  const [leaderboardEnabled, setLeaderboardEnabled] = useState(data.leaderboardEnabled ?? true);

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-yellow-500 to-amber-500 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Gamification Hub</h3>
        </div>
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
          <p className="font-medium mb-1">Learner achievement dashboard</p>
          <p>Display points, badges, and leaderboard rankings to motivate learners</p>
        </div>
        <div>
          <label
            htmlFor="gamification-hub-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Dashboard Title
          </label>
          <input
            id="gamification-hub-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, title: e.target.value } as Record<string, unknown>,
              });
            }}
            placeholder="e.g., Your Learning Progress"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-yellow-500"
          />
        </div>
        <div>
          <span className="block text-sm font-medium text-brand-secondary mb-2">
            Enabled Features
          </span>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-2 border border-brand-default rounded-lg hover:bg-brand-page cursor-pointer">
              <input
                type="checkbox"
                checked={pointsEnabled}
                onChange={(e) => {
                  setPointsEnabled(e.target.checked);
                  props.onUpdate({
                    ...props.block,
                    content: { ...data, pointsEnabled: e.target.checked } as Record<
                      string,
                      unknown
                    >,
                  });
                }}
                className="w-4 h-4 text-yellow-600 rounded"
              />
              <TrendingUp className="w-4 h-4 text-brand-secondary" />
              <span className="text-sm text-brand-primary">Points System</span>
            </label>
            <label className="flex items-center gap-3 p-2 border border-brand-default rounded-lg hover:bg-brand-page cursor-pointer">
              <input
                type="checkbox"
                checked={badgesEnabled}
                onChange={(e) => {
                  setBadgesEnabled(e.target.checked);
                  props.onUpdate({
                    ...props.block,
                    content: { ...data, badgesEnabled: e.target.checked } as Record<
                      string,
                      unknown
                    >,
                  });
                }}
                className="w-4 h-4 text-yellow-600 rounded"
              />
              <Award className="w-4 h-4 text-brand-secondary" />
              <span className="text-sm text-brand-primary">Badges & Achievements</span>
            </label>
            <label className="flex items-center gap-3 p-2 border border-brand-default rounded-lg hover:bg-brand-page cursor-pointer">
              <input
                type="checkbox"
                checked={leaderboardEnabled}
                onChange={(e) => {
                  setLeaderboardEnabled(e.target.checked);
                  props.onUpdate({
                    ...props.block,
                    content: { ...data, leaderboardEnabled: e.target.checked } as Record<
                      string,
                      unknown
                    >,
                  });
                }}
                className="w-4 h-4 text-yellow-600 rounded"
              />
              <Trophy className="w-4 h-4 text-brand-secondary" />
              <span className="text-sm text-brand-primary">Leaderboard</span>
            </label>
          </div>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
