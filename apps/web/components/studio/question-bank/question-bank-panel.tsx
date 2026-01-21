'use client';

/**
 * QuestionBankPanel - Phase 11
 * Main panel for managing question banks
 */

import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Copy,
  Edit3,
  Filter,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Question, QuestionBank, QuestionType } from '@/types/studio/question-bank';

// =============================================================================
// TYPES
// =============================================================================

interface QuestionBankPanelProps {
  banks: QuestionBank[];
  selectedBankId?: string;
  selectedQuestionId?: string;
  onSelectBank: (bankId: string) => void;
  onSelectQuestion: (questionId: string) => void;
  onCreateBank: () => void;
  onEditBank: (bankId: string) => void;
  onDeleteBank: (bankId: string) => void;
  onDuplicateBank: (bankId: string) => void;
  onCreateQuestion: (bankId: string, type: QuestionType) => void;
  onEditQuestion: (questionId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
  onDuplicateQuestion: (questionId: string) => void;
  onMoveQuestion: (questionId: string, targetBankId: string) => void;
  onClose?: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  'multiple-choice': 'Multiple Choice',
  'multiple-select': 'Multiple Select',
  'true-false': 'True/False',
  'fill-in-blank': 'Fill in Blank',
  'short-answer': 'Short Answer',
  essay: 'Essay',
  matching: 'Matching',
  ordering: 'Ordering/Sequence',
  hotspot: 'Hotspot',
  likert: 'Likert Scale',
  ranking: 'Ranking',
  slider: 'Slider',
};

const QUESTION_TYPE_ICONS: Record<QuestionType, string> = {
  'multiple-choice': 'MC',
  'multiple-select': 'MS',
  'true-false': 'T/F',
  'fill-in-blank': '___',
  'short-answer': 'Aa',
  essay: 'ESY',
  matching: 'MTH',
  ordering: '123',
  hotspot: 'HOT',
  likert: 'LIK',
  ranking: 'RNK',
  slider: 'SLD',
};

const DIFFICULTY_LABELS = ['', 'Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
const DIFFICULTY_COLORS = [
  '',
  'text-green-400',
  'text-lime-400',
  'text-yellow-400',
  'text-orange-400',
  'text-red-400',
];

// =============================================================================
// QUESTION ITEM COMPONENT
// =============================================================================

interface QuestionItemProps {
  question: Question;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function QuestionItem({
  question,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onDuplicate,
}: QuestionItemProps) {
  return (
    <div
      className={cn(
        'group px-3 py-2 rounded-md transition-colors',
        isSelected ? 'bg-primary/20 border border-primary/40' : 'hover:bg-white/5',
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer text-left"
          onClick={onSelect}
        >
          {/* Type Icon */}
          <span className="w-6 h-6 flex items-center justify-center text-xs font-mono text-zinc-400 bg-zinc-800 rounded">
            {QUESTION_TYPE_ICONS[question.type]}
          </span>

          {/* Question Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{question.text}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-zinc-500">
                {QUESTION_TYPE_LABELS[question.type]}
              </span>
              {question.difficulty && (
                <span className={cn('text-[10px]', DIFFICULTY_COLORS[question.difficulty])}>
                  {DIFFICULTY_LABELS[question.difficulty]}
                </span>
              )}
              {question.points && (
                <span className="text-[10px] text-zinc-500">{question.points} pts</span>
              )}
            </div>
          </div>
        </button>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit3 className="h-3 w-3 mr-2" />
              Edit Question
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-3 w-3 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-400">
              <Trash2 className="h-3 w-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5 pl-8">
          {question.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[9px] px-1 py-0 h-4">
              {tag}
            </Badge>
          ))}
          {question.tags.length > 3 && (
            <span className="text-[9px] text-zinc-500">+{question.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// BANK ITEM COMPONENT
// =============================================================================

interface BankItemProps {
  bank: QuestionBank;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function BankItem({
  bank,
  isSelected,
  isExpanded,
  onSelect,
  onToggle,
  onEdit,
  onDelete,
  onDuplicate,
}: BankItemProps) {
  return (
    <div
      className={cn(
        'group px-2 py-1.5 rounded-md cursor-pointer transition-colors',
        isSelected ? 'bg-primary/10' : 'hover:bg-white/5',
      )}
    >
      <div className="flex items-center gap-1">
        {/* Expand/Collapse */}
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </Button>

        {/* Bank Info */}
        <button
          type="button"
          className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer text-left"
          onClick={onSelect}
        >
          <FolderOpen className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm text-white truncate">{bank.name}</span>
          <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 shrink-0">
            {bank.questions.length}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              'text-[9px] px-1 py-0 h-4 shrink-0',
              bank.bankType === 'quiz' && 'border-blue-500/50 text-blue-400',
              bank.bankType === 'survey' && 'border-purple-500/50 text-purple-400',
              bank.bankType === 'mixed' && 'border-amber-500/50 text-amber-400',
            )}
          >
            {bank.bankType}
          </Badge>
        </button>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 opacity-0 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit3 className="h-3 w-3 mr-2" />
              Edit Bank
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-3 w-3 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-400">
              <Trash2 className="h-3 w-3 mr-2" />
              Delete Bank
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// =============================================================================
// ADD QUESTION MENU
// =============================================================================

interface AddQuestionMenuProps {
  onAdd: (type: QuestionType) => void;
}

function AddQuestionMenu({ onAdd }: AddQuestionMenuProps) {
  const quizTypes: QuestionType[] = [
    'multiple-choice',
    'multiple-select',
    'true-false',
    'fill-in-blank',
    'short-answer',
    'essay',
    'matching',
    'ordering',
    'hotspot',
  ];

  const surveyTypes: QuestionType[] = ['likert', 'ranking', 'slider'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 gap-1">
          <Plus className="h-3 w-3" />
          Add Question
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <div className="px-2 py-1 text-[10px] text-zinc-500 font-medium">QUIZ QUESTIONS</div>
        {quizTypes.map((type) => (
          <DropdownMenuItem key={type} onClick={() => onAdd(type)}>
            <span className="w-6 text-center font-mono text-xs">{QUESTION_TYPE_ICONS[type]}</span>
            {QUESTION_TYPE_LABELS[type]}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1 text-[10px] text-zinc-500 font-medium">SURVEY QUESTIONS</div>
        {surveyTypes.map((type) => (
          <DropdownMenuItem key={type} onClick={() => onAdd(type)}>
            <span className="w-6 text-center font-mono text-xs">{QUESTION_TYPE_ICONS[type]}</span>
            {QUESTION_TYPE_LABELS[type]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function QuestionBankPanel({
  banks,
  selectedBankId,
  selectedQuestionId,
  onSelectBank,
  onSelectQuestion,
  onCreateBank,
  onEditBank,
  onDeleteBank,
  onDuplicateBank,
  onCreateQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onDuplicateQuestion,
  onMoveQuestion: _onMoveQuestion,
  onClose,
}: QuestionBankPanelProps) {
  const [expandedBanks, setExpandedBanks] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<QuestionType | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<number | 'all'>('all');

  // Get selected bank
  const selectedBank = banks.find((b) => b.id === selectedBankId);

  // Toggle bank expansion
  const toggleBank = useCallback((bankId: string) => {
    setExpandedBanks((prev) => {
      const next = new Set(prev);
      if (next.has(bankId)) {
        next.delete(bankId);
      } else {
        next.add(bankId);
      }
      return next;
    });
  }, []);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    if (!selectedBank) return [];

    return selectedBank.questions.filter((q) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.text.toLowerCase().includes(query);
        const matchesTags = q.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesText && !matchesTags) return false;
      }

      // Type filter
      if (filterType !== 'all' && q.type !== filterType) return false;

      // Difficulty filter
      if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;

      return true;
    });
  }, [selectedBank, searchQuery, filterType, filterDifficulty]);

  // Stats for selected bank
  const bankStats = useMemo(() => {
    if (!selectedBank) return null;
    const questions = selectedBank.questions;
    const typeCount: Partial<Record<QuestionType, number>> = {};
    const difficultyCount: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const q of questions) {
      typeCount[q.type] = (typeCount[q.type] || 0) + 1;
      if (q.difficulty) {
        difficultyCount[q.difficulty]++;
      }
    }

    return { typeCount, difficultyCount, total: questions.length };
  }, [selectedBank]);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0f]">
      {/* Header */}
      <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm text-white">Question Banks</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7" onClick={onCreateBank}>
            <Plus className="h-3 w-3 mr-1" />
            New Bank
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <span className="text-lg">×</span>
            </Button>
          )}
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex min-h-0">
        {/* Banks List (Left) */}
        <div className="w-64 border-r border-white/10 flex flex-col">
          <ScrollArea className="flex-1 p-2">
            <div className="space-y-1">
              {banks.length === 0 ? (
                <div className="py-8 text-center text-zinc-500">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No question banks</p>
                  <p className="text-xs mt-1">Create a bank to get started</p>
                </div>
              ) : (
                banks.map((bank) => (
                  <BankItem
                    key={bank.id}
                    bank={bank}
                    isSelected={bank.id === selectedBankId}
                    isExpanded={expandedBanks.has(bank.id)}
                    onSelect={() => onSelectBank(bank.id)}
                    onToggle={() => toggleBank(bank.id)}
                    onEdit={() => onEditBank(bank.id)}
                    onDelete={() => onDeleteBank(bank.id)}
                    onDuplicate={() => onDuplicateBank(bank.id)}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Questions List (Right) */}
        <div className="flex-1 flex flex-col">
          {selectedBank ? (
            <>
              {/* Bank Header */}
              <div className="px-4 py-3 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-white">{selectedBank.name}</h3>
                    {selectedBank.description && (
                      <p className="text-xs text-zinc-500 mt-0.5">{selectedBank.description}</p>
                    )}
                  </div>
                  <AddQuestionMenu onAdd={(type) => onCreateQuestion(selectedBank.id, type)} />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-500" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search questions..."
                      className="h-7 pl-7 bg-zinc-900 border-white/10 text-sm"
                    />
                  </div>
                  <Select
                    value={filterType}
                    onValueChange={(v) => setFilterType(v as QuestionType | 'all')}
                  >
                    <SelectTrigger className="w-32 h-7 bg-zinc-900 border-white/10 text-xs">
                      <Filter className="h-3 w-3 mr-1" />
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(QUESTION_TYPE_LABELS).map(([type, label]) => (
                        <SelectItem key={type} value={type}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={String(filterDifficulty)}
                    onValueChange={(v) => setFilterDifficulty(v === 'all' ? 'all' : Number(v))}
                  >
                    <SelectTrigger className="w-28 h-7 bg-zinc-900 border-white/10 text-xs">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {[1, 2, 3, 4, 5].map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {DIFFICULTY_LABELS[d]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Stats */}
                {bankStats && (
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-500">
                    <span>{bankStats.total} questions</span>
                    <span className="text-zinc-700">|</span>
                    {Object.entries(bankStats.typeCount)
                      .slice(0, 3)
                      .map(([type, count]) => (
                        <span key={type}>
                          {count} {QUESTION_TYPE_LABELS[type as QuestionType]}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Questions */}
              <ScrollArea className="flex-1 p-2">
                <div className="space-y-1">
                  {filteredQuestions.length === 0 ? (
                    <div className="py-8 text-center text-zinc-500">
                      <Search className="h-6 w-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {searchQuery || filterType !== 'all' || filterDifficulty !== 'all'
                          ? 'No questions match your filters'
                          : 'No questions in this bank'}
                      </p>
                    </div>
                  ) : (
                    filteredQuestions.map((question) => (
                      <QuestionItem
                        key={question.id}
                        question={question}
                        isSelected={question.id === selectedQuestionId}
                        onSelect={() => onSelectQuestion(question.id)}
                        onEdit={() => onEditQuestion(question.id)}
                        onDelete={() => onDeleteQuestion(question.id)}
                        onDuplicate={() => onDuplicateQuestion(question.id)}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-zinc-500">
                <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Select a bank to view questions</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/5 shrink-0">
        <p className="text-[10px] text-zinc-500 text-center">
          Question banks store reusable questions. Create pools to randomize draws for assessments.
        </p>
      </div>
    </div>
  );
}

export default QuestionBankPanel;
