'use client';

/**
 * VariablePicker - Popover component for inserting dynamic variables into content
 */

import {
  BookOpen,
  Check,
  Copy,
  Plus,
  Search,
  Settings,
  User,
  Variable as VariableIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVariables } from '@/providers/variables-provider';
import type { Variable, VariableType } from '@/types/variables';

interface VariablePickerProps {
  onSelect: (variableKey: string) => void;
  triggerClassName?: string;
}

/**
 * VariablePicker - Insert dynamic variables into content
 */
export function VariablePicker({ onSelect, triggerClassName }: VariablePickerProps) {
  const { variables, addCustomVariable, getValue } = useVariables();
  const [search, setSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newVar, setNewVar] = useState({
    name: '',
    key: '',
    type: 'text' as VariableType,
    defaultValue: '',
  });

  const filteredVariables = useMemo(() => {
    if (!search) return variables;
    const lower = search.toLowerCase();
    return variables.filter(
      (v) => v.name.toLowerCase().includes(lower) || v.key.toLowerCase().includes(lower),
    );
  }, [variables, search]);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(`{{${key}}}`);
    setCopiedKey(key);
    const timeout = setTimeout(() => setCopiedKey(null), 2000);
    return () => clearTimeout(timeout);
  };

  const handleInsert = (key: string) => {
    onSelect(`{{${key}}}`);
  };

  const handleCreateVariable = () => {
    if (!newVar.name || !newVar.key) return;
    addCustomVariable({
      name: newVar.name,
      key: `custom.${newVar.key}`,
      type: newVar.type,
      defaultValue: newVar.defaultValue,
      description: `Custom variable: ${newVar.name}`,
    });
    setNewVar({ name: '', key: '', type: 'text', defaultValue: '' });
    setShowCreateDialog(false);
  };

  const getCategoryIcon = (category: Variable['category']) => {
    switch (category) {
      case 'system':
        return <Settings className="w-3 h-3" />;
      case 'learner':
        return <User className="w-3 h-3" />;
      case 'course':
        return <BookOpen className="w-3 h-3" />;
      case 'custom':
        return <VariableIcon className="w-3 h-3" />;
    }
  };

  const renderVariableList = (vars: Variable[]) => (
    <div className="space-y-1">
      {vars.map((variable) => (
        <button
          type="button"
          key={variable.id}
          className="flex items-center gap-2 p-2 rounded-sm hover:bg-zinc-800 cursor-pointer group w-full text-left"
          onClick={() => handleInsert(variable.key)}
        >
          {getCategoryIcon(variable.category)}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{variable.name}</div>
            <div className="text-[10px] text-zinc-500 font-mono truncate">{`{{${variable.key}}}`}</div>
          </div>
          <div className="text-xs text-zinc-500 hidden group-hover:block">
            {String(getValue(variable.key) ?? variable.defaultValue).slice(0, 15)}
            {String(getValue(variable.key) ?? variable.defaultValue).length > 15 && '...'}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy(variable.key);
            }}
          >
            {copiedKey === variable.key ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </button>
      ))}
      {vars.length === 0 && (
        <div className="text-sm text-zinc-500 text-center py-4">No variables found</div>
      )}
    </div>
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClassName}>
          <VariableIcon className="w-4 h-4 mr-1" />
          Insert Variable
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-(--studio-surface) border-white/10" align="start">
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search variables..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 bg-zinc-900 border-white/10"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full justify-start px-3 py-1 h-auto bg-transparent">
            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-primary/20">
              All
            </TabsTrigger>
            <TabsTrigger value="learner" className="text-xs data-[state=active]:bg-primary/20">
              Learner
            </TabsTrigger>
            <TabsTrigger value="course" className="text-xs data-[state=active]:bg-primary/20">
              Course
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs data-[state=active]:bg-primary/20">
              System
            </TabsTrigger>
            <TabsTrigger value="custom" className="text-xs data-[state=active]:bg-primary/20">
              Custom
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[250px]">
            <TabsContent value="all" className="p-2 m-0">
              {renderVariableList(filteredVariables)}
            </TabsContent>
            <TabsContent value="learner" className="p-2 m-0">
              {renderVariableList(filteredVariables.filter((v) => v.category === 'learner'))}
            </TabsContent>
            <TabsContent value="course" className="p-2 m-0">
              {renderVariableList(filteredVariables.filter((v) => v.category === 'course'))}
            </TabsContent>
            <TabsContent value="system" className="p-2 m-0">
              {renderVariableList(filteredVariables.filter((v) => v.category === 'system'))}
            </TabsContent>
            <TabsContent value="custom" className="p-2 m-0">
              {renderVariableList(filteredVariables.filter((v) => v.category === 'custom'))}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="p-2 border-t border-white/10">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full border-white/10">
                <Plus className="w-4 h-4 mr-1" />
                Create Custom Variable
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-(--studio-surface) border-white/10">
              <DialogHeader>
                <DialogTitle>Create Custom Variable</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newVar.name}
                    onChange={(e) => setNewVar({ ...newVar, name: e.target.value })}
                    placeholder="My Variable"
                    className="bg-zinc-900 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Key</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500">custom.</span>
                    <Input
                      value={newVar.key}
                      onChange={(e) =>
                        setNewVar({
                          ...newVar,
                          key: e.target.value.replace(/[^a-zA-Z0-9_]/g, ''),
                        })
                      }
                      placeholder="myVariable"
                      className="flex-1 bg-zinc-900 border-white/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newVar.type}
                    onValueChange={(v) => setNewVar({ ...newVar, type: v as VariableType })}
                  >
                    <SelectTrigger className="bg-zinc-900 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Value</Label>
                  <Input
                    value={newVar.defaultValue}
                    onChange={(e) => setNewVar({ ...newVar, defaultValue: e.target.value })}
                    placeholder="Default value"
                    className="bg-zinc-900 border-white/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  className="border-white/10"
                  onClick={() => setShowCreateDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateVariable} disabled={!newVar.name || !newVar.key}>
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default VariablePicker;
