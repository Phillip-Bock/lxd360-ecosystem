'use client';

import { RibbonGroup } from '../ribbon-group';
import { TransitionsSection } from '../sections/transitions-section';

export function TransitionsTab(): React.JSX.Element {
  return (
    <div className="flex items-start gap-1.5">
      <RibbonGroup title="Framer Motion">
        <TransitionsSection />
      </RibbonGroup>
    </div>
  );
}
