'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

interface StatItem {
  target: number;
  label: string;
}

export function StatisticsDisplay(): React.JSX.Element {
  const [stats, setStats] = useState<StatItem[]>([
    { target: 87, label: 'Engagement' },
    { target: 95, label: 'Completion' },
    { target: 150, label: 'Resources' },
  ]);
  const [currentValues, setCurrentValues] = useState([0, 0, 0]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          stats.forEach((stat, index) => {
            let count = 0;
            const increment = stat.target / 100;
            const timer = setInterval(() => {
              count += increment;
              if (count >= stat.target) {
                setCurrentValues((prev) => {
                  const newValues = [...prev];
                  newValues[index] = stat.target;
                  return newValues;
                });
                clearInterval(timer);
              } else {
                setCurrentValues((prev) => {
                  const newValues = [...prev];
                  newValues[index] = Math.ceil(count);
                  return newValues;
                });
              }
            }, 20);
          });
        }
      },
      { threshold: 0.5 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, stats]);

  const updateLabel = (index: number, newLabel: string) => {
    setStats((prev) => {
      const newStats = [...prev];
      newStats[index] = { ...newStats[index], label: newLabel };
      return newStats;
    });
  };

  const addStat = () => {
    setStats((prev) => [...prev, { target: 100, label: 'New Stat' }]);
    setCurrentValues((prev) => [...prev, 100]);
  };

  const removeStat = (index: number) => {
    setStats((prev) => prev.filter((_, i) => i !== index));
    setCurrentValues((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div
      ref={containerRef}
      className="bg-lxd-dark-page border border-lxd-dark-surface rounded-xl p-8"
    >
      <div className="flex justify-around text-center">
        {stats.map((stat, index) => (
          <div key={index} className="relative group">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeStat(index)}
              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 h-6 w-6 text-lxd-error hover:text-lxd-error/80 hover:bg-lxd-error/20"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
            <div className="text-5xl font-bold text-lxd-blue mb-2">{currentValues[index]}</div>
            {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
            <div
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-label="Statistic label"
              tabIndex={0}
              onBlur={(e) => updateLabel(index, e.currentTarget.textContent || '')}
              className="text-lxd-text-light-muted outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-2"
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-4">
        <Button
          variant="ghost"
          onClick={addStat}
          className="text-lxd-success hover:text-lxd-success hover:bg-lxd-success/10"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Statistic
        </Button>
      </div>
    </div>
  );
}
