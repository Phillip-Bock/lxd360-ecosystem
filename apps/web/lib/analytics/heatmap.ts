/**
 * Skill Gap Heatmap Generator
 *
 * Implements Artemis vision: "A 3D visualization of the organization.
 * Red zones show departments where 'Compliance' is high but 'Competency'
 * (quiz confidence) is low—predicting where the next accident will happen."
 */

import { logger } from '@/lib/logger';
import type { Department, HeatmapCell, SkillGapHeatmap, SkillMetrics } from './god-view-types';

const log = logger.scope('Heatmap');

// =============================================================================
// CONSTANTS
// =============================================================================

/** Threshold for competency (mastery above this = competent) */
const COMPETENCY_THRESHOLD = 0.7;

/** Weight for false confidence in risk calculation */
const FALSE_CONFIDENCE_WEIGHT = 0.3;

// =============================================================================
// CORE FUNCTIONS
// =============================================================================

/**
 * Calculate skill metrics for a group of learners
 */
export function calculateSkillMetrics(
  skillId: string,
  skillName: string,
  masteryScores: number[],
  falseConfidenceFlags: boolean[],
): SkillMetrics {
  if (masteryScores.length === 0) {
    return {
      skillId,
      skillName,
      avgMastery: 0,
      masteryStdDev: 0,
      competencyRate: 0,
      assessedCount: 0,
      falseConfidenceCount: 0,
    };
  }

  // Calculate average
  const avgMastery = masteryScores.reduce((a, b) => a + b, 0) / masteryScores.length;

  // Calculate standard deviation
  const squaredDiffs = masteryScores.map((score) => (score - avgMastery) ** 2);
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length;
  const masteryStdDev = Math.sqrt(avgSquaredDiff);

  // Calculate competency rate
  const competentCount = masteryScores.filter((s) => s >= COMPETENCY_THRESHOLD).length;
  const competencyRate = competentCount / masteryScores.length;

  // Count false confidence flags
  const falseConfidenceCount = falseConfidenceFlags.filter((f) => f).length;

  return {
    skillId,
    skillName,
    avgMastery: Math.round(avgMastery * 100) / 100,
    masteryStdDev: Math.round(masteryStdDev * 100) / 100,
    competencyRate: Math.round(competencyRate * 100) / 100,
    assessedCount: masteryScores.length,
    falseConfidenceCount,
  };
}

/**
 * Calculate risk value for a heatmap cell (0 = safe/green, 1 = risk/red)
 */
export function calculateCellRisk(metrics: SkillMetrics): number {
  // Base risk from low mastery
  const masteryRisk = 1 - metrics.avgMastery;

  // Additional risk from false confidence
  const falseConfidenceRate =
    metrics.assessedCount > 0 ? metrics.falseConfidenceCount / metrics.assessedCount : 0;
  const falseConfidenceRisk = falseConfidenceRate * FALSE_CONFIDENCE_WEIGHT;

  // Additional risk from high variance (inconsistent knowledge)
  const varianceRisk = Math.min(metrics.masteryStdDev * 0.5, 0.2);

  // Combine risks (capped at 1)
  const totalRisk = Math.min(1, masteryRisk + falseConfidenceRisk + varianceRisk);

  return Math.round(totalRisk * 100) / 100;
}

/**
 * Generate heatmap cell for a department-skill combination
 */
export function generateHeatmapCell(departmentId: string, metrics: SkillMetrics): HeatmapCell {
  return {
    departmentId,
    skillId: metrics.skillId,
    value: calculateCellRisk(metrics),
    metadata: {
      avgMastery: metrics.avgMastery,
      memberCount: metrics.assessedCount,
      falseConfidenceRate:
        metrics.assessedCount > 0 ? metrics.falseConfidenceCount / metrics.assessedCount : 0,
    },
  };
}

/**
 * Generate complete skill gap heatmap
 */
export function generateHeatmap(
  departments: Department[],
  skills: { id: string; name: string }[],
  departmentMetrics: Map<string, Map<string, SkillMetrics>>,
): SkillGapHeatmap {
  const cells: HeatmapCell[] = [];

  for (const dept of departments) {
    const deptMetrics = departmentMetrics.get(dept.id);
    if (!deptMetrics) continue;

    for (const skill of skills) {
      const skillMetrics = deptMetrics.get(skill.id);
      if (skillMetrics) {
        cells.push(generateHeatmapCell(dept.id, skillMetrics));
      } else {
        // No data for this skill in this department
        cells.push({
          departmentId: dept.id,
          skillId: skill.id,
          value: 0.5, // Neutral (no data)
          metadata: {
            avgMastery: 0,
            memberCount: 0,
            falseConfidenceRate: 0,
          },
        });
      }
    }
  }

  log.info('Heatmap generated', {
    departments: departments.length,
    skills: skills.length,
    cells: cells.length,
  });

  return {
    departments,
    skills,
    cells,
    generatedAt: new Date(),
  };
}

/**
 * Get hotspots (highest risk areas) from heatmap
 */
export function getHotspots(heatmap: SkillGapHeatmap, limit: number = 10): HeatmapCell[] {
  return [...heatmap.cells].sort((a, b) => b.value - a.value).slice(0, limit);
}

/**
 * Get Glass Box explanation for a heatmap cell
 */
export function explainCell(cell: HeatmapCell, departmentName: string, skillName: string): string {
  const riskPercent = Math.round(cell.value * 100);
  const masteryPercent = Math.round(cell.metadata.avgMastery * 100);
  const fcPercent = Math.round(cell.metadata.falseConfidenceRate * 100);

  if (cell.value < 0.3) {
    return (
      `${departmentName} shows strong competency in ${skillName} ` +
      `(${masteryPercent}% average mastery). Low risk area.`
    );
  }

  if (cell.value < 0.6) {
    return (
      `${departmentName} has moderate competency in ${skillName} ` +
      `(${masteryPercent}% average mastery). Consider targeted training.`
    );
  }

  let explanation =
    `${departmentName} shows concerning gaps in ${skillName} ` +
    `(${masteryPercent}% average mastery, ${riskPercent}% risk score).`;

  if (fcPercent > 10) {
    explanation +=
      ` Additionally, ${fcPercent}% of learners show false confidence — ` +
      `they believe they're more competent than their performance indicates.`;
  }

  return explanation;
}

/**
 * Calculate overall department risk from heatmap cells
 */
export function calculateDepartmentRisk(heatmap: SkillGapHeatmap, departmentId: string): number {
  const deptCells = heatmap.cells.filter((cell) => cell.departmentId === departmentId);

  if (deptCells.length === 0) return 0;

  // Weight by member count
  let weightedSum = 0;
  let totalWeight = 0;

  for (const cell of deptCells) {
    const weight = Math.max(1, cell.metadata.memberCount);
    weightedSum += cell.value * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) / 100 : 0;
}

/**
 * Get departments sorted by risk level
 */
export function getDepartmentsByRisk(
  heatmap: SkillGapHeatmap,
): { departmentId: string; departmentName: string; riskScore: number }[] {
  const deptRisks = heatmap.departments.map((dept) => ({
    departmentId: dept.id,
    departmentName: dept.name,
    riskScore: calculateDepartmentRisk(heatmap, dept.id),
  }));

  return deptRisks.sort((a, b) => b.riskScore - a.riskScore);
}
