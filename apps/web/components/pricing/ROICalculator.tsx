'use client';

import { Building2, Calculator, Clock, DollarSign, Percent, TrendingUp, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { ROIInputs, ROIResults } from '@/types/pricing';

interface ROICalculatorProps {
  className?: string;
}

export function ROICalculator({ className }: ROICalculatorProps) {
  const [inputs, setInputs] = useState<ROIInputs>({
    learners: 100,
    coursesPerYear: 10,
    avgCourseLength: 60, // minutes
    currentLMSCost: 25000,
    hrlyWage: 35,
    currentCompletionRate: 60,
    travelTrainingPercent: 20,
    avgTravelCost: 500,
  });

  const results = useMemo<ROIResults>(() => {
    // Time savings from adaptive learning (30% faster)
    const totalTrainingHours =
      (inputs.learners * inputs.coursesPerYear * inputs.avgCourseLength) / 60;
    const hoursSaved = totalTrainingHours * 0.3;
    const timeSavingsValue = hoursSaved * inputs.hrlyWage;

    // Completion rate improvement (40% better)
    const newCompletionRate = Math.min(inputs.currentCompletionRate * 1.4, 98);
    const completionImprovement = newCompletionRate - inputs.currentCompletionRate;

    // Travel reduction (ILT to eLearning conversion)
    const travelSavings =
      (inputs.travelTrainingPercent / 100) * inputs.learners * inputs.avgTravelCost * 0.7;

    // LXP360 cost (estimate based on learner count)
    let lxp360Cost = 4800; // Scale tier yearly
    if (inputs.learners <= 5) lxp360Cost = 470;
    else if (inputs.learners <= 20) lxp360Cost = 1910;
    else if (inputs.learners <= 100) lxp360Cost = 4800;
    else if (inputs.learners <= 500) lxp360Cost = 18000;
    else lxp360Cost = inputs.learners * 30; // Enterprise estimate

    // LMS cost savings
    const lmsSavings = Math.max(inputs.currentLMSCost - lxp360Cost, 0);

    // Total ROI
    const totalSavings = timeSavingsValue + travelSavings + lmsSavings;
    const roi = lxp360Cost > 0 ? ((totalSavings - lxp360Cost) / lxp360Cost) * 100 : 0;

    return {
      hoursSaved: Math.round(hoursSaved),
      timeSavingsValue: Math.round(timeSavingsValue),
      completionImprovement: Math.round(completionImprovement),
      travelSavings: Math.round(travelSavings),
      lxp360Cost,
      lmsSavings: Math.round(lmsSavings),
      totalSavings: Math.round(totalSavings),
      roi: Math.round(roi),
    };
  }, [inputs]);

  const updateInput = (key: keyof ROIInputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      className={cn(
        'bg-(--background-dark) border border-(--lxd-dark-surface-alt)/50 rounded-2xl overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-(--lxd-dark-surface-alt)/50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-linear-to-br from-(--secondary-blue)/20 to-(--accent-purple-light)/20 rounded-xl">
            <Calculator className="w-6 h-6 text-(--secondary-blue)" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-brand-primary">ROI Calculator</h3>
            <p className="text-(--text-muted-dark) text-sm">
              See your potential savings with LXP360
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 p-6 md:p-8">
        {/* Inputs */}
        <div className="space-y-6">
          <h4 className="text-brand-primary font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4 text-(--secondary-blue)" />
            Your Organization
          </h4>

          <div className="space-y-5">
            <div>
              <label htmlFor="roi-learners" className="flex justify-between text-sm mb-2">
                <span className="text-(--text-secondary-dark)">Number of Learners</span>
                <span className="text-brand-primary font-medium">
                  {inputs.learners.toLocaleString()}
                </span>
              </label>
              <input
                id="roi-learners"
                type="range"
                min="5"
                max="1000"
                step="5"
                value={inputs.learners}
                onChange={(e) => updateInput('learners', Number(e.target.value))}
                className="w-full h-2 bg-(--lxd-dark-surface-alt) rounded-lg appearance-none cursor-pointer accent-(--secondary-blue)"
              />
              <div className="flex justify-between text-xs text-(--text-muted-dark) mt-1">
                <span>5</span>
                <span>500</span>
                <span>1000+</span>
              </div>
            </div>

            <div>
              <label htmlFor="roi-courses-per-year" className="flex justify-between text-sm mb-2">
                <span className="text-(--text-secondary-dark)">Courses per Learner/Year</span>
                <span className="text-brand-primary font-medium">{inputs.coursesPerYear}</span>
              </label>
              <input
                id="roi-courses-per-year"
                type="range"
                min="1"
                max="50"
                value={inputs.coursesPerYear}
                onChange={(e) => updateInput('coursesPerYear', Number(e.target.value))}
                className="w-full h-2 bg-(--lxd-dark-surface-alt) rounded-lg appearance-none cursor-pointer accent-(--secondary-blue)"
              />
            </div>

            <div>
              <label htmlFor="roi-course-length" className="flex justify-between text-sm mb-2">
                <span className="text-(--text-secondary-dark)">Avg. Course Length (min)</span>
                <span className="text-brand-primary font-medium">{inputs.avgCourseLength}</span>
              </label>
              <input
                id="roi-course-length"
                type="range"
                min="15"
                max="180"
                step="5"
                value={inputs.avgCourseLength}
                onChange={(e) => updateInput('avgCourseLength', Number(e.target.value))}
                className="w-full h-2 bg-(--lxd-dark-surface-alt) rounded-lg appearance-none cursor-pointer accent-(--secondary-blue)"
              />
            </div>

            <div>
              <label
                htmlFor="roi-lms-cost"
                className="block text-(--text-secondary-dark) text-sm mb-2"
              >
                Current LMS Annual Cost ($)
              </label>
              <input
                id="roi-lms-cost"
                type="number"
                value={inputs.currentLMSCost}
                onChange={(e) => updateInput('currentLMSCost', Number(e.target.value))}
                className="w-full px-4 py-3 bg-(--background-dark) border border-(--lxd-dark-surface-alt)/50 rounded-xl text-brand-primary focus:outline-hidden focus:border-(--secondary-blue)/50 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="roi-completion-rate" className="flex justify-between text-sm mb-2">
                <span className="text-(--text-secondary-dark)">Current Completion Rate (%)</span>
                <span className="text-brand-primary font-medium">
                  {inputs.currentCompletionRate}%
                </span>
              </label>
              <input
                id="roi-completion-rate"
                type="range"
                min="20"
                max="95"
                value={inputs.currentCompletionRate}
                onChange={(e) => updateInput('currentCompletionRate', Number(e.target.value))}
                className="w-full h-2 bg-(--lxd-dark-surface-alt) rounded-lg appearance-none cursor-pointer accent-(--secondary-blue)"
              />
            </div>

            <div>
              <label htmlFor="roi-travel-training" className="flex justify-between text-sm mb-2">
                <span className="text-(--text-secondary-dark)">% Training Currently In-Person</span>
                <span className="text-brand-primary font-medium">
                  {inputs.travelTrainingPercent}%
                </span>
              </label>
              <input
                id="roi-travel-training"
                type="range"
                min="0"
                max="100"
                step="5"
                value={inputs.travelTrainingPercent}
                onChange={(e) => updateInput('travelTrainingPercent', Number(e.target.value))}
                className="w-full h-2 bg-(--lxd-dark-surface-alt) rounded-lg appearance-none cursor-pointer accent-(--secondary-blue)"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-linear-to-br from-(--background-dark) to-(--background-dark) rounded-xl p-6">
          <h4 className="text-brand-primary font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-success" />
            Your Projected Savings
          </h4>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-3 bg-(--background-dark)/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-(--secondary-blue)" />
                <div>
                  <span className="text-(--text-secondary-dark) text-sm">Time Savings</span>
                  <span className="block text-xs text-(--text-muted-dark)">
                    {results.hoursSaved.toLocaleString()} hours/year
                  </span>
                </div>
              </div>
              <span className="text-brand-primary font-medium">
                ${results.timeSavingsValue.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-(--background-dark)/50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-brand-success" />
                <div>
                  <span className="text-(--text-secondary-dark) text-sm">
                    Completion Rate Boost
                  </span>
                  <span className="block text-xs text-(--text-muted-dark)">
                    Adaptive learning impact
                  </span>
                </div>
              </div>
              <span className="text-brand-success font-medium">
                +{results.completionImprovement}%
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-(--background-dark)/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-brand-warning" />
                <div>
                  <span className="text-(--text-secondary-dark) text-sm">Travel Reduction</span>
                  <span className="block text-xs text-(--text-muted-dark)">
                    ILT to eLearning conversion
                  </span>
                </div>
              </div>
              <span className="text-brand-primary font-medium">
                ${results.travelSavings.toLocaleString()}
              </span>
            </div>

            {results.lmsSavings > 0 && (
              <div className="flex items-center justify-between p-3 bg-(--background-dark)/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-brand-purple" />
                  <div>
                    <span className="text-(--text-secondary-dark) text-sm">LMS Cost Savings</span>
                    <span className="block text-xs text-(--text-muted-dark)">
                      vs. current platform
                    </span>
                  </div>
                </div>
                <span className="text-brand-primary font-medium">
                  ${results.lmsSavings.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="border-t border-(--lxd-dark-surface-alt)/50 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-(--text-secondary-dark)">LXP360 Investment</span>
              <span className="text-brand-primary">
                ${results.lxp360Cost.toLocaleString()}/year
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-brand-primary font-medium">Total Annual Savings</span>
              <span className="text-2xl font-bold text-brand-success">
                ${results.totalSavings.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-linear-to-r from-(--secondary-blue)/10 to-(--accent-purple-light)/10 rounded-xl">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-(--secondary-blue)" />
                <span className="text-brand-primary font-medium">Estimated ROI</span>
              </div>
              <span className="text-3xl font-bold text-(--secondary-blue)">{results.roi}%</span>
            </div>
          </div>

          <p className="text-(--text-muted-dark) text-xs mt-6 text-center">
            * Estimates based on industry averages. Actual results may vary.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ROICalculator;
