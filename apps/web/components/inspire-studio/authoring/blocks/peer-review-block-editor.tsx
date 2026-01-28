import { Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';
import { BaseBlockEditor, type BaseBlockEditorProps } from './base-block-editor';

interface PeerReviewData {
  title?: string;
  instructions?: string;
  submissionType?: string;
  reviewsRequired?: number;
  rubricCriteria?: string[];
}

export const PeerReviewBlockEditor = (props: BaseBlockEditorProps): React.JSX.Element => {
  const data = (props.block?.content as PeerReviewData) || {};
  const [title, setTitle] = useState(data.title || '');
  const [instructions, setInstructions] = useState(data.instructions || '');
  const [submissionType, setSubmissionType] = useState(data.submissionType || 'text');
  const [reviewsRequired, setReviewsRequired] = useState(data.reviewsRequired || 3);
  const [rubricCriteria, setRubricCriteria] = useState(
    data.rubricCriteria || ['Quality', 'Clarity', 'Relevance'],
  );

  return (
    <BaseBlockEditor {...props}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-linear-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-brand-primary" />
          </div>
          <h3 className="font-semibold text-brand-primary">Peer Review</h3>
          <span className="ml-auto px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
            Social
          </span>
        </div>

        <div>
          <label
            htmlFor="peer-review-title"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Assignment Title
          </label>
          <input
            id="peer-review-title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              props.onUpdate({ ...props.block, content: { ...data, title: e.target.value } });
            }}
            placeholder="e.g., Essay Peer Review"
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label
            htmlFor="peer-review-instructions"
            className="block text-sm font-medium text-brand-secondary mb-2"
          >
            Instructions
          </label>
          <textarea
            id="peer-review-instructions"
            value={instructions}
            onChange={(e) => {
              setInstructions(e.target.value);
              props.onUpdate({
                ...props.block,
                content: { ...data, instructions: e.target.value },
              });
            }}
            placeholder="Explain what learners should submit..."
            className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-emerald-500 resize-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="peer-review-submission-type"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Submission Type
            </label>
            <select
              id="peer-review-submission-type"
              value={submissionType}
              onChange={(e) => {
                setSubmissionType(e.target.value);
                props.onUpdate({
                  ...props.block,
                  content: { ...data, submissionType: e.target.value },
                });
              }}
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="text">Text Response</option>
              <option value="video">Video Upload</option>
              <option value="file">File Upload</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="peer-review-reviews-required"
              className="block text-sm font-medium text-brand-secondary mb-2"
            >
              Reviews Per Submission
            </label>
            <input
              id="peer-review-reviews-required"
              type="number"
              value={reviewsRequired}
              onChange={(e) => {
                setReviewsRequired(parseInt(e.target.value, 10));
                props.onUpdate({
                  ...props.block,
                  content: { ...data, reviewsRequired: parseInt(e.target.value, 10) },
                });
              }}
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-brand-strong rounded-lg focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <fieldset>
          <div className="flex items-center justify-between mb-2">
            <legend className="block text-sm font-medium text-brand-secondary">
              Rubric Criteria
            </legend>
            <button
              type="button"
              onClick={() => {
                const updated = [...rubricCriteria, 'New Criterion'];
                setRubricCriteria(updated);
                props.onUpdate({ ...props.block, content: { ...data, rubricCriteria: updated } });
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>
          <div className="space-y-2">
            {rubricCriteria.map((criterion: string, idx: number) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={criterion}
                  aria-label={`Criterion ${idx + 1}`}
                  onChange={(e) => {
                    const updated = [...rubricCriteria];
                    updated[idx] = e.target.value;
                    setRubricCriteria(updated);
                    props.onUpdate({
                      ...props.block,
                      content: { ...data, rubricCriteria: updated },
                    });
                  }}
                  className="flex-1 px-2 py-1 text-sm border border-brand-strong rounded"
                />
                <button
                  type="button"
                  aria-label={`Remove criterion ${idx + 1}`}
                  onClick={() => {
                    const updated = rubricCriteria.filter((_: string, i: number) => i !== idx);
                    setRubricCriteria(updated);
                    props.onUpdate({
                      ...props.block,
                      content: { ...data, rubricCriteria: updated },
                    });
                  }}
                  className="p-1 text-brand-muted hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </fieldset>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <p className="font-medium mb-1">Anonymous Review Process:</p>
          <p>
            Each submission is automatically distributed to {reviewsRequired} anonymous peers.
            Reviewers cannot see submitter identities.
          </p>
        </div>
      </div>
    </BaseBlockEditor>
  );
};
