/**
 * =============================================================================
 * CONFIDENCE CALCULATION — Unit Tests
 * =============================================================================
 * Tests for deep xAPI profile confidence calculation functions.
 *
 * These tests verify the "False Confidence" detection algorithms used
 * for analyzing learner hesitation and engagement patterns.
 * =============================================================================
 */

import { describe, expect, it } from 'vitest';

import {
  analyzeConfidenceDistribution,
  buildHesitationData,
  CONFIDENCE_THRESHOLDS,
  calculateConfidence,
  calculateConfidenceScore,
  calculateFocusScore,
  detectFalseConfidence,
  detectInteractionPattern,
} from '../confidence';

// =============================================================================
// calculateConfidence Tests
// =============================================================================

describe('calculateConfidence', () => {
  describe('mastery detection', () => {
    it('should return mastery for fast answer with no changes', () => {
      // Fast: < 0.5 speedRatio, no changes
      const result = calculateConfidence(0, 2000, 10000);
      expect(result).toBe('mastery');
    });

    it('should return mastery at the threshold boundary', () => {
      // Exactly at 0.5 speedRatio should NOT be mastery (< not <=)
      const result = calculateConfidence(0, 5000, 10000);
      expect(result).toBe('confident');
    });

    it('should not return mastery if there are any changes', () => {
      const result = calculateConfidence(1, 2000, 10000);
      expect(result).not.toBe('mastery');
    });
  });

  describe('confident detection', () => {
    it('should return confident for normal speed with minimal changes', () => {
      const result = calculateConfidence(1, 8000, 10000);
      expect(result).toBe('confident');
    });

    it('should return confident for no changes at normal speed', () => {
      const result = calculateConfidence(0, 7000, 10000);
      expect(result).toBe('confident');
    });

    it('should return confident at boundary of normal threshold', () => {
      // 9999ms / 10000ms = 0.9999 < 1.0
      const result = calculateConfidence(1, 9999, 10000);
      expect(result).toBe('confident');
    });
  });

  describe('uncertain detection', () => {
    it('should return uncertain for moderate changes with slower response', () => {
      const result = calculateConfidence(2, 15000, 10000);
      expect(result).toBe('uncertain');
    });

    it('should return uncertain for minimal changes but slow response', () => {
      const result = calculateConfidence(1, 12000, 10000);
      expect(result).toBe('uncertain');
    });
  });

  describe('guessing detection', () => {
    it('should return guessing for many changes', () => {
      const result = calculateConfidence(4, 15000, 10000);
      expect(result).toBe('guessing');
    });

    it('should return guessing for very slow responses', () => {
      const result = calculateConfidence(1, 25000, 10000);
      expect(result).toBe('guessing');
    });

    it('should return guessing for fast response WITH changes (random clicking)', () => {
      // This is the "false confidence" pattern - clicking quickly through options
      const result = calculateConfidence(3, 2000, 10000);
      expect(result).toBe('guessing');
    });

    it('should detect guessing when very fast with even one change', () => {
      // speedRatio < 0.3 with changes = guessing
      const result = calculateConfidence(1, 2500, 10000);
      expect(result).toBe('guessing');
    });
  });

  describe('edge cases', () => {
    it('should return uncertain for zero expected time', () => {
      const result = calculateConfidence(0, 5000, 0);
      expect(result).toBe('uncertain');
    });

    it('should return uncertain for negative expected time', () => {
      const result = calculateConfidence(0, 5000, -1000);
      expect(result).toBe('uncertain');
    });

    it('should handle zero time to answer', () => {
      const result = calculateConfidence(0, 0, 10000);
      expect(result).toBe('mastery');
    });

    it('should handle very large numbers', () => {
      const result = calculateConfidence(100, 1000000, 10000);
      expect(result).toBe('guessing');
    });
  });
});

// =============================================================================
// calculateConfidenceScore Tests
// =============================================================================

describe('calculateConfidenceScore', () => {
  it('should return high score for perfect response', () => {
    const score = calculateConfidenceScore(0, 3000, 10000);
    expect(score).toBeGreaterThanOrEqual(90);
    expect(score).toBeLessThanOrEqual(105); // Can get bonus
  });

  it('should penalize for answer changes', () => {
    const scoreNoChanges = calculateConfidenceScore(0, 8000, 10000);
    const scoreOneChange = calculateConfidenceScore(1, 8000, 10000);
    const scoreTwoChanges = calculateConfidenceScore(2, 8000, 10000);

    expect(scoreNoChanges).toBeGreaterThan(scoreOneChange);
    expect(scoreOneChange).toBeGreaterThan(scoreTwoChanges);
  });

  it('should penalize for slow responses', () => {
    const fastScore = calculateConfidenceScore(0, 5000, 10000);
    const normalScore = calculateConfidenceScore(0, 10000, 10000);
    const slowScore = calculateConfidenceScore(0, 15000, 10000);

    // Fast and normal with no changes both cap at 100
    // The key distinction is slow responses get penalized
    expect(fastScore).toBeGreaterThanOrEqual(normalScore);
    expect(normalScore).toBeGreaterThan(slowScore);
  });

  it('should heavily penalize guessing pattern', () => {
    // Fast + changes = guessing
    const guessingScore = calculateConfidenceScore(2, 2000, 10000);
    const normalScore = calculateConfidenceScore(2, 8000, 10000);

    expect(guessingScore).toBeLessThan(normalScore);
  });

  it('should return score between 0 and 100', () => {
    // Test various combinations
    const testCases = [
      [0, 1000, 10000],
      [5, 50000, 10000],
      [10, 100000, 10000],
      [0, 5000, 10000],
    ] as const;

    for (const [changes, time, expected] of testCases) {
      const score = calculateConfidenceScore(changes, time, expected);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  it('should handle edge cases gracefully', () => {
    expect(calculateConfidenceScore(0, 5000, 0)).toBe(50);
    expect(calculateConfidenceScore(0, 5000, -100)).toBe(50);
  });
});

// =============================================================================
// calculateFocusScore Tests
// =============================================================================

describe('calculateFocusScore', () => {
  it('should return 100 for full focus (no idle, no blur)', () => {
    const score = calculateFocusScore(60000, 0, 0);
    expect(score).toBe(100);
  });

  it('should return 0 for zero total time', () => {
    const score = calculateFocusScore(0, 0, 0);
    expect(score).toBe(0);
  });

  it('should calculate correct ratio', () => {
    // 60s total, 15s idle, 5s blur = 40s active = 67%
    const score = calculateFocusScore(60000, 15000, 5000);
    expect(score).toBeCloseTo(67, 0);
  });

  it('should cap at 0 when inactive time exceeds total', () => {
    // This shouldn't happen in practice, but should be handled
    const score = calculateFocusScore(60000, 40000, 30000);
    expect(score).toBe(0);
  });

  it('should handle 50% focus correctly', () => {
    const score = calculateFocusScore(100000, 25000, 25000);
    expect(score).toBe(50);
  });

  it('should round to nearest integer', () => {
    const score = calculateFocusScore(100000, 33333, 0);
    expect(Number.isInteger(score)).toBe(true);
  });
});

// =============================================================================
// detectInteractionPattern Tests
// =============================================================================

describe('detectInteractionPattern', () => {
  describe('clicking-through detection', () => {
    it('should detect clicking-through for very fast with low focus', () => {
      // timeRatio < 0.3 and focusScore < 30
      const pattern = detectInteractionPattern(200, 20, 2000, 10000);
      expect(pattern).toBe('clicking-through');
    });
  });

  describe('skimming detection', () => {
    it('should detect skimming for fast scroll with low focus', () => {
      // scrollVelocity > 500 and focusScore < 50
      const pattern = detectInteractionPattern(800, 40, 10000, 10000);
      expect(pattern).toBe('skimming');
    });

    it('should return skimming as default when uncertain', () => {
      const pattern = detectInteractionPattern(300, 55, 5000, 10000);
      expect(pattern).toBe('skimming');
    });
  });

  describe('deep engagement detection', () => {
    it('should detect deep engagement for good time and high focus', () => {
      // timeRatio >= 0.7 and focusScore >= 70
      const pattern = detectInteractionPattern(100, 85, 8000, 10000);
      expect(pattern).toBe('deep');
    });

    it('should detect deep engagement at threshold boundaries', () => {
      const pattern = detectInteractionPattern(100, 70, 7000, 10000);
      expect(pattern).toBe('deep');
    });
  });

  describe('revisiting detection', () => {
    it('should detect revisiting for excessive time with moderate focus', () => {
      // timeRatio > 1.5 and focusScore >= 50
      const pattern = detectInteractionPattern(200, 60, 20000, 10000);
      expect(pattern).toBe('revisiting');
    });
  });

  describe('edge cases', () => {
    it('should return skimming for zero expected time', () => {
      const pattern = detectInteractionPattern(100, 50, 5000, 0);
      expect(pattern).toBe('skimming');
    });

    it('should return skimming for negative expected time', () => {
      const pattern = detectInteractionPattern(100, 50, 5000, -1000);
      expect(pattern).toBe('skimming');
    });
  });
});

// =============================================================================
// buildHesitationData Tests
// =============================================================================

describe('buildHesitationData', () => {
  it('should add confidence indicator to raw data', () => {
    const rawData = {
      answer_changes: 1,
      time_to_first_answer_ms: 3000,
      time_to_final_answer_ms: 8000,
    };

    const result = buildHesitationData(rawData, 10000);

    expect(result.answer_changes).toBe(1);
    expect(result.time_to_first_answer_ms).toBe(3000);
    expect(result.time_to_final_answer_ms).toBe(8000);
    expect(result.confidence_indicator).toBe('confident');
  });

  it('should preserve optional fields', () => {
    const rawData = {
      answer_changes: 0,
      time_to_first_answer_ms: 2000,
      time_to_final_answer_ms: 2000,
      answer_sequence: ['A', 'B', 'A'],
      dwell_times_ms: [1000, 500, 500],
    };

    const result = buildHesitationData(rawData, 10000);

    expect(result.answer_sequence).toEqual(['A', 'B', 'A']);
    expect(result.dwell_times_ms).toEqual([1000, 500, 500]);
    expect(result.confidence_indicator).toBe('mastery');
  });
});

// =============================================================================
// analyzeConfidenceDistribution Tests
// =============================================================================

describe('analyzeConfidenceDistribution', () => {
  it('should count distribution correctly', () => {
    const data = [
      { confidence_indicator: 'mastery' as const },
      { confidence_indicator: 'confident' as const },
      { confidence_indicator: 'confident' as const },
      { confidence_indicator: 'uncertain' as const },
    ];

    const result = analyzeConfidenceDistribution(data);

    expect(result.total).toBe(4);
    expect(result.distribution.mastery).toBe(1);
    expect(result.distribution.confident).toBe(2);
    expect(result.distribution.uncertain).toBe(1);
    expect(result.distribution.guessing).toBe(0);
  });

  it('should calculate percentages correctly', () => {
    const data = [
      { confidence_indicator: 'mastery' as const },
      { confidence_indicator: 'mastery' as const },
      { confidence_indicator: 'confident' as const },
      { confidence_indicator: 'guessing' as const },
    ];

    const result = analyzeConfidenceDistribution(data);

    expect(result.percentages.mastery).toBe(50);
    expect(result.percentages.confident).toBe(25);
    expect(result.percentages.uncertain).toBe(0);
    expect(result.percentages.guessing).toBe(25);
  });

  it('should calculate average score correctly', () => {
    const data = [
      { confidence_indicator: 'mastery' as const }, // 100
      { confidence_indicator: 'guessing' as const }, // 25
    ];

    const result = analyzeConfidenceDistribution(data);

    expect(result.averageScore).toBe(62.5);
  });

  it('should find dominant indicator correctly', () => {
    const data = [
      { confidence_indicator: 'confident' as const },
      { confidence_indicator: 'confident' as const },
      { confidence_indicator: 'uncertain' as const },
    ];

    const result = analyzeConfidenceDistribution(data);

    expect(result.dominantIndicator).toBe('confident');
  });

  it('should handle empty array', () => {
    const result = analyzeConfidenceDistribution([]);

    expect(result.total).toBe(0);
    expect(result.averageScore).toBe(0);
    expect(result.distribution.mastery).toBe(0);
  });

  it('should favor higher confidence in ties', () => {
    const data = [
      { confidence_indicator: 'mastery' as const },
      { confidence_indicator: 'guessing' as const },
    ];

    const result = analyzeConfidenceDistribution(data);

    // Both have count 1, should favor mastery (checked first)
    expect(result.dominantIndicator).toBe('mastery');
  });
});

// =============================================================================
// detectFalseConfidence Tests
// =============================================================================

describe('detectFalseConfidence', () => {
  it('should detect false confidence for high score with low confidence indicators', () => {
    const data = [
      { confidence_indicator: 'guessing' as const },
      { confidence_indicator: 'uncertain' as const },
      { confidence_indicator: 'guessing' as const },
    ];

    const result = detectFalseConfidence(85, data);

    expect(result.hasFalseConfidence).toBe(true);
    expect(result.scoreConfidenceGap).toBeGreaterThan(25);
    expect(result.recommendation).toBeTruthy();
  });

  it('should not flag false confidence for aligned score and confidence', () => {
    const data = [
      { confidence_indicator: 'mastery' as const },
      { confidence_indicator: 'confident' as const },
      { confidence_indicator: 'confident' as const },
    ];

    const result = detectFalseConfidence(85, data);

    expect(result.hasFalseConfidence).toBe(false);
  });

  it('should not flag false confidence for low score', () => {
    const data = [
      { confidence_indicator: 'guessing' as const },
      { confidence_indicator: 'guessing' as const },
    ];

    // Even with guessing, low score doesn't indicate false confidence
    const result = detectFalseConfidence(50, data);

    expect(result.hasFalseConfidence).toBe(false);
  });

  it('should provide stronger recommendation for large gap', () => {
    const data = [
      { confidence_indicator: 'guessing' as const },
      { confidence_indicator: 'guessing' as const },
      { confidence_indicator: 'guessing' as const },
    ];

    const result = detectFalseConfidence(90, data);

    expect(result.scoreConfidenceGap).toBeGreaterThanOrEqual(40);
    expect(result.recommendation).toContain('comprehensive review');
  });

  it('should recommend practice when confidence exceeds score', () => {
    const data = [
      { confidence_indicator: 'mastery' as const },
      { confidence_indicator: 'mastery' as const },
    ];

    const result = detectFalseConfidence(60, data);

    expect(result.hasFalseConfidence).toBe(false);
    expect(result.recommendation).toContain('practice');
  });

  it('should return null recommendation when no issues', () => {
    const data = [
      { confidence_indicator: 'confident' as const },
      { confidence_indicator: 'confident' as const },
    ];

    const result = detectFalseConfidence(75, data);

    expect(result.recommendation).toBeNull();
  });
});

// =============================================================================
// CONFIDENCE_THRESHOLDS Tests
// =============================================================================

describe('CONFIDENCE_THRESHOLDS', () => {
  it('should have sensible threshold values', () => {
    expect(CONFIDENCE_THRESHOLDS.FAST_THRESHOLD).toBeLessThan(
      CONFIDENCE_THRESHOLDS.NORMAL_THRESHOLD,
    );
    expect(CONFIDENCE_THRESHOLDS.NORMAL_THRESHOLD).toBeLessThan(
      CONFIDENCE_THRESHOLDS.SLOW_THRESHOLD,
    );
    expect(CONFIDENCE_THRESHOLDS.GUESSING_FAST_THRESHOLD).toBeLessThan(
      CONFIDENCE_THRESHOLDS.FAST_THRESHOLD,
    );
    expect(CONFIDENCE_THRESHOLDS.LOW_CHANGES_THRESHOLD).toBeLessThan(
      CONFIDENCE_THRESHOLDS.MODERATE_CHANGES_THRESHOLD,
    );
  });
});
