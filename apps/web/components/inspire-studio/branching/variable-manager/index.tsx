'use client';

import { Bug, Plus, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { createVariable } from '@/components/inspire-studio/branching/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useScenarioStore } from '@/store/inspire/useScenarioStore';
import { VariableDebugger } from './variable-debugger';
import { VariableEditor } from './variable-editor';

// =============================================================================
// Variable Manager Component
// =============================================================================

interface VariableManagerProps {
  className?: string;
  readOnly?: boolean;
}

export function VariableManager({ className, readOnly = false }: VariableManagerProps) {
  const [activeTab, setActiveTab] = useState<'design' | 'debug'>('design');

  const variables = useScenarioStore((state) => state.scenario.variables);
  const variableValues = useScenarioStore((state) => state.variableValues);
  const isPlaying = useScenarioStore((state) => state.isPlaying);
  const addVariable = useScenarioStore((state) => state.addVariable);
  const updateVariable = useScenarioStore((state) => state.updateVariable);
  const deleteVariable = useScenarioStore((state) => state.deleteVariable);
  const selectedVariableKey = useScenarioStore((state) => state.selectedVariableKey);
  const setSelectedVariable = useScenarioStore((state) => state.setSelectedVariable);

  const handleAddVariable = () => {
    const newVar = createVariable('number');
    addVariable(newVar);
    setSelectedVariable(newVar.key);
  };

  return (
    <div
      className={cn(
        'flex flex-col h-full',
        'bg-lxd-dark-bg border-l border-lxd-dark-border',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-lxd-dark-border">
        <h3 className="text-sm font-semibold text-white">Variables</h3>
        {!readOnly && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddVariable}
            className="h-7 px-2 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'design' | 'debug')}
        className="flex-1 flex flex-col"
      >
        <TabsList className="mx-4 mt-2 bg-lxd-dark-surface">
          <TabsTrigger value="design" className="text-xs gap-1">
            <Settings2 className="w-3 h-3" />
            Design
          </TabsTrigger>
          <TabsTrigger value="debug" className="text-xs gap-1">
            <Bug className="w-3 h-3" />
            Debug
          </TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="flex-1 overflow-hidden mt-0 p-0">
          <div className="h-full overflow-y-auto p-4 space-y-2">
            {variables.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-white/50">No variables defined</p>
                <p className="text-xs text-white/30 mt-1">Click "Add" to create a variable</p>
              </div>
            ) : (
              variables.map((variable) => (
                <VariableEditor
                  key={variable.key}
                  variable={variable}
                  isSelected={selectedVariableKey === variable.key}
                  readOnly={readOnly}
                  onSelect={() => setSelectedVariable(variable.key)}
                  onChange={(updates) => updateVariable(variable.key, updates)}
                  onDelete={() => deleteVariable(variable.key)}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="debug" className="flex-1 overflow-hidden mt-0 p-0">
          <VariableDebugger
            variables={variables}
            liveValues={isPlaying ? variableValues : undefined}
            className="h-full"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default VariableManager;
