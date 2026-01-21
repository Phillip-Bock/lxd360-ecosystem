'use client';

import { Download, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function DefinitionList(): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [definitions, setDefinitions] = useState([
    {
      term: 'SCORM',
      definition: 'Sharable Content Object Reference Model, a standard for e-learning content.',
    },
    {
      term: 'xAPI',
      definition: 'Experience API, a newer standard that tracks learning experiences.',
    },
    {
      term: 'LMS',
      definition: 'Learning Management System, a platform for delivering online courses.',
    },
  ]);

  const filteredDefinitions = definitions.filter(
    (def) =>
      def.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      def.definition.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const downloadCSV = () => {
    const csvContent = `Term,Definition\n${definitions.map((d) => `"${d.term}","${d.definition}"`).join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'definitions.csv';
    a.click();
  };

  const addDefinition = () => {
    setDefinitions([...definitions, { term: 'New Term', definition: 'Enter definition here...' }]);
  };

  const removeDefinition = (index: number) => {
    setDefinitions(definitions.filter((_, i) => i !== index));
  };

  const updateDefinition = (index: number, field: 'term' | 'definition', value: string) => {
    const newDefs = [...definitions];
    newDefs[index][field] = value;
    setDefinitions(newDefs);
  };

  return (
    <div className="bg-lxd-dark-page border border-lxd-dark-surface rounded-2xl shadow-lg p-8 mb-6">
      <div className="flex gap-3 mb-6">
        <Input
          type="text"
          placeholder="Search terms or definitions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-lxd-dark-surface border-lxd-dark-surface text-lxd-text-light-heading placeholder:text-lxd-text-light-muted"
        />
        <Button
          onClick={addDefinition}
          className="bg-lxd-success hover:bg-lxd-success/80 text-lxd-dark-page"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
        <Button onClick={downloadCSV} className="bg-lxd-blue hover:bg-lxd-blue/80">
          <Download className="w-4 h-4 mr-2" />
          CSV
        </Button>
      </div>
      <dl className="space-y-4">
        {filteredDefinitions.map((def, index) => (
          <div key={index} className="flex items-start border-b border-lxd-dark-surface pb-4 gap-2">
            {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
            <div
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-label="Term"
              tabIndex={0}
              onBlur={(e) => updateDefinition(index, 'term', e.currentTarget.textContent || '')}
              className="font-bold w-1/3 text-lxd-blue outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-1"
            >
              {def.term}
            </div>
            {/* biome-ignore lint/a11y/useSemanticElements: contentEditable requires div with role="textbox" for rich text */}
            <div
              contentEditable
              suppressContentEditableWarning
              role="textbox"
              aria-label="Definition"
              tabIndex={0}
              onBlur={(e) =>
                updateDefinition(index, 'definition', e.currentTarget.textContent || '')
              }
              className="w-2/3 text-lxd-text-light-secondary outline-hidden focus:ring-2 focus:ring-lxd-blue rounded px-1"
            >
              {def.definition}
            </div>
            <button
              type="button"
              onClick={() => removeDefinition(index)}
              className="text-lxd-text-light-muted hover:text-lxd-error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default DefinitionList;
