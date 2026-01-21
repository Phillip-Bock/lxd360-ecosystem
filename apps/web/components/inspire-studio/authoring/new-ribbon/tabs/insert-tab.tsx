'use client';

import {
  BarChart3,
  CheckSquare,
  Circle,
  Film,
  Globe,
  Grid3x3,
  Image,
  Link2,
  MessageSquare,
  Mic,
  RadioTower,
  Shapes,
  Sliders,
  Square,
  Star,
  Table,
  Triangle,
  Type,
  Variable,
  Video,
} from 'lucide-react';
import { useEditor } from '@/lib/inspire-studio/editor-context';
import { RibbonButton } from '../ribbon-button';
import { RibbonGroup } from '../ribbon-group';

export function InsertTab(): React.JSX.Element {
  const { insertShape } = useEditor();

  return (
    <div className="flex items-start gap-1.5">
      <RibbonGroup title="Shapes">
        <div className="grid grid-cols-3 gap-0.5">
          <RibbonButton
            icon={Square}
            label="Rectangle"
            size="small"
            onClick={() => insertShape('rectangle')}
          />
          <RibbonButton
            icon={Circle}
            label="Circle"
            size="small"
            onClick={() => insertShape('circle')}
          />
          <RibbonButton
            icon={Triangle}
            label="Triangle"
            size="small"
            onClick={() => insertShape('triangle')}
          />
          <RibbonButton icon={Star} label="Star" size="small" onClick={() => insertShape('star')} />
          <RibbonButton icon={MessageSquare} label="Callouts" size="small" />
          <RibbonButton icon={Shapes} label="Flowchart" size="small" />
        </div>
      </RibbonGroup>

      <RibbonGroup title="Images">
        <div className="flex flex-col gap-0.5">
          <RibbonButton icon={Image} label="Picture" size="small" />
          <RibbonButton icon={Image} label="Content Library" size="small" />
          <RibbonButton icon={Image} label="Icons" size="small" />
        </div>
      </RibbonGroup>

      <RibbonGroup title="Media">
        <div className="flex flex-col gap-0.5">
          <RibbonButton icon={Mic} label="Audio" size="small" />
          <RibbonButton icon={Video} label="Video" size="small" />
          <RibbonButton icon={Film} label="Screen Recording" size="small" />
          <RibbonButton icon={Globe} label="Web Object" size="small" />
        </div>
      </RibbonGroup>

      <RibbonGroup title="Text">
        <div className="flex flex-col gap-0.5">
          <RibbonButton icon={Type} label="Text Box" size="small" />
          <RibbonButton icon={Link2} label="Hyperlink" size="small" />
          <RibbonButton icon={Type} label="Character Map" size="small" />
        </div>
      </RibbonGroup>

      <RibbonGroup title="Tables">
        <RibbonButton icon={Table} label="Table" size="medium" />
      </RibbonGroup>

      <RibbonGroup title="Objects">
        <div className="grid grid-cols-2 gap-0.5">
          <RibbonButton icon={Square} label="Button" size="small" />
          <RibbonButton icon={CheckSquare} label="Checkbox" size="small" />
          <RibbonButton icon={RadioTower} label="Radio" size="small" />
          <RibbonButton icon={Type} label="Text Entry" size="small" />
          <RibbonButton icon={Sliders} label="Slider" size="small" />
          <RibbonButton icon={Grid3x3} label="Dropdown" size="small" />
        </div>
      </RibbonGroup>

      <RibbonGroup title="Illustrations">
        <div className="flex gap-0.5">
          <RibbonButton icon={BarChart3} label="Chart" size="small" />
          <RibbonButton icon={Shapes} label="SmartArt" size="small" />
        </div>
      </RibbonGroup>

      <RibbonGroup title="Variables">
        <RibbonButton icon={Variable} label="Variables" size="medium" />
      </RibbonGroup>
    </div>
  );
}
