'use client';

import { AlertCircle, RefreshCw, Sparkles, Target } from 'lucide-react';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { LearningSection } from '@/components/ignite/learner';
import {
  RecommendationCard,
  RecommendationCardSkeleton,
} from '@/components/ignite/recommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  dismissRecommendation,
  generateRecommendations,
  getMyRecommendations,
  respondToRecommendation,
} from '@/lib/actions/recommendations';
import { cn } from '@/lib/utils';
import { useSafeAuth } from '@/providers/SafeAuthProvider';
import type { RecommendationWithDetails } from '@/types/lms/recommendation';

export const dynamic = 'force-dynamic';

interface RecommendationsState {
  recommendations: RecommendationWithDetails[];
  readinessScore: number;
  totalGaps: number;
  totalEstimatedHours: number;
}

/**
 * Recommendations Page - Learner's personalized course recommendations
 *
 * Features:
 * - AI-generated recommendations based on O*NET skill gaps
 * - Accept/reject workflow
 * - Readiness score display
 * - Generate new recommendations
 */
export default function RecommendationsPage() {
  const { user } = useSafeAuth();
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<RecommendationsState>({
    recommendations: [],
    readinessScore: 0,
    totalGaps: 0,
    totalEstimatedHours: 0,
  });

  // Load existing recommendations
  const loadRecommendations = useCallback(async () => {
    if (!user?.uid) return;

    const result = await getMyRecommendations();
    if ('error' in result) {
      setError(result.error);
      return;
    }

    setState((prev) => ({
      ...prev,
      recommendations: result.data.recommendations,
    }));
  }, [user?.uid]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // Generate new recommendations
  const handleGenerate = async () => {
    if (!user?.uid) return;

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateRecommendations(user.uid);
      if ('error' in result) {
        setError(result.error);
        return;
      }

      setState({
        recommendations: result.data.recommendations,
        readinessScore: result.data.readinessScore,
        totalGaps: result.data.totalGaps,
        totalEstimatedHours: result.data.totalEstimatedHours,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Accept recommendation
  const handleAccept = async (id: string) => {
    startTransition(async () => {
      const result = await respondToRecommendation(id, true);
      if ('error' in result) {
        setError(result.error);
        return;
      }

      // Remove from list or update status
      setState((prev) => ({
        ...prev,
        recommendations: prev.recommendations.filter((r) => r.id !== id),
      }));
    });
  };

  // Reject recommendation
  const handleReject = async (id: string, feedback?: string) => {
    startTransition(async () => {
      const result = await respondToRecommendation(id, false, feedback);
      if ('error' in result) {
        setError(result.error);
        return;
      }

      // Remove from list
      setState((prev) => ({
        ...prev,
        recommendations: prev.recommendations.filter((r) => r.id !== id),
      }));
    });
  };

  // Dismiss recommendation
  const handleDismiss = async (id: string) => {
    startTransition(async () => {
      const result = await dismissRecommendation(id);
      if ('error' in result) {
        setError(result.error);
        return;
      }

      // Remove from list
      setState((prev) => ({
        ...prev,
        recommendations: prev.recommendations.filter((r) => r.id !== id),
      }));
    });
  };

  const pendingRecommendations = state.recommendations.filter((r) => r.status === 'pending');
  const awaitingApproval = state.recommendations.filter((r) => r.status === 'pending_approval');

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skill Gap Recommendations</h1>
          <p className="text-muted-foreground mt-1">
            Personalized course recommendations based on your career goals
          </p>
        </div>
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || isPending}
          className="shrink-0"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" aria-hidden />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" aria-hidden />
              Generate Recommendations
            </>
          )}
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" aria-hidden />
            <p className="text-sm text-red-500">{error}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-600"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Readiness Score Card */}
      {state.readinessScore > 0 && (
        <Card className="bg-gradient-to-r from-lxd-primary/10 to-lxd-secondary/10 border-lxd-primary/30">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'p-3 rounded-full',
                    state.readinessScore >= 80
                      ? 'bg-lxd-success/20 text-lxd-success'
                      : state.readinessScore >= 50
                        ? 'bg-lxd-caution/20 text-lxd-caution'
                        : 'bg-lxd-warning/20 text-lxd-warning',
                  )}
                >
                  <Target className="w-6 h-6" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role Readiness</p>
                  <p className="text-3xl font-bold text-foreground">{state.readinessScore}%</p>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress to target role</span>
                  <span className="font-medium text-foreground">{state.readinessScore}%</span>
                </div>
                <Progress value={state.readinessScore} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">{state.totalGaps}</p>
                  <p className="text-xs text-muted-foreground">Skill Gaps</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round(state.totalEstimatedHours)}h
                  </p>
                  <p className="text-xs text-muted-foreground">Est. Training</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Recommendations */}
      <LearningSection
        title="Recommended for You"
        icon={Sparkles}
        itemCount={pendingRecommendations.length}
        emptyMessage={
          state.recommendations.length === 0
            ? "Click 'Generate Recommendations' to get personalized course suggestions based on your skill gaps."
            : 'No pending recommendations. Generate new ones or check back later!'
        }
        isEmpty={pendingRecommendations.length === 0}
        isLoading={isGenerating}
        skeletonCount={3}
        skeleton={<RecommendationCardSkeleton />}
        columns={3}
      >
        {pendingRecommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            onAccept={handleAccept}
            onReject={handleReject}
            onDismiss={handleDismiss}
            isLoading={isPending}
          />
        ))}
      </LearningSection>

      {/* Awaiting Approval */}
      {awaitingApproval.length > 0 && (
        <LearningSection
          title="Awaiting Manager Approval"
          icon={Target}
          itemCount={awaitingApproval.length}
          emptyMessage="No recommendations awaiting approval."
          isEmpty={awaitingApproval.length === 0}
          columns={2}
        >
          {awaitingApproval.map((recommendation) => (
            <Card key={recommendation.id} className="bg-lxd-dark-surface border-lxd-dark-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                    <Target className="w-5 h-5" aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {recommendation.courseName || 'Course'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Waiting for your manager to approve this enrollment
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </LearningSection>
      )}

      {/* Info card about how recommendations work */}
      <Card className="bg-lxd-dark-surface/50 border-lxd-dark-border">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-lxd-primary/10 text-lxd-primary shrink-0">
              <Sparkles className="w-5 h-5" aria-hidden />
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">How Recommendations Work</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Our AI analyzes your current skills against your target career goals using O*NET
                occupational data. We identify skill gaps and recommend courses that will help you
                close those gaps most efficiently.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  <strong className="text-foreground">Critical gaps</strong> are skills essential
                  for your target role with significant room for improvement
                </li>
                <li>
                  <strong className="text-foreground">High priority</strong> skills are important
                  and need attention
                </li>
                <li>
                  <strong className="text-foreground">Match score</strong> indicates how well the
                  course addresses your specific gaps
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
