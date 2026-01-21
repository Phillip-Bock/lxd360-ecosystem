'use client';

import { RibbonGroup } from '../ribbon-group';
import { AnimationsSection } from '../sections/animations-section';

export function AnimationsTab(): React.JSX.Element {
  return (
    <div className="flex items-start gap-1.5">
      <RibbonGroup title="GSAP Text Animations" className="min-w-[500px]">
        <AnimationsSection />
      </RibbonGroup>
    </div>
  );
}
