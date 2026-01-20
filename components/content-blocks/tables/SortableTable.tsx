'use client';

import { ArrowUpDown } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export function SortableTable(): React.JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState([
    { standard: 'SCORM', released: '1999', mobile: 'No' },
    { standard: 'AICC', released: '1993', mobile: 'No' },
    { standard: 'xAPI', released: '2013', mobile: 'Yes' },
    { standard: 'cmi5', released: '2016', mobile: 'Yes' },
  ]);

  const filteredData = data.filter((row) =>
    Object.values(row).some((val) => val.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const sortByColumn = (key: keyof (typeof data)[0]) => {
    const sorted = [...data].sort((a, b) => a[key].localeCompare(b[key]));
    setData(sorted);
  };

  return (
    <div className="bg-lxd-dark-page rounded-xl border border-lxd-dark-surface p-6 mb-6">
      <h4 className="text-lg font-semibold text-lxd-text-light-heading mb-4">
        Sortable/Filterable Data Table
      </h4>
      <Input
        type="text"
        placeholder="Filter table..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 bg-lxd-dark-surface border-lxd-dark-surface text-lxd-text-light-heading placeholder:text-lxd-text-light-muted"
      />
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-lxd-dark-surface">
            <th
              onClick={() => sortByColumn('standard')}
              className="text-left p-3 cursor-pointer hover:bg-lxd-dark-surface/80 text-lxd-blue font-medium rounded-tl-lg"
            >
              Standard <ArrowUpDown className="inline w-4 h-4 ml-1" />
            </th>
            <th
              onClick={() => sortByColumn('released')}
              className="text-left p-3 cursor-pointer hover:bg-lxd-dark-surface/80 text-lxd-blue font-medium"
            >
              Released <ArrowUpDown className="inline w-4 h-4 ml-1" />
            </th>
            <th
              onClick={() => sortByColumn('mobile')}
              className="text-left p-3 cursor-pointer hover:bg-lxd-dark-surface/80 text-lxd-blue font-medium rounded-tr-lg"
            >
              Mobile Support <ArrowUpDown className="inline w-4 h-4 ml-1" />
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index} className="border-b border-lxd-dark-surface hover:bg-lxd-dark-surface">
              <td className="p-3 text-lxd-text-light-heading">{row.standard}</td>
              <td className="p-3 text-lxd-text-light-secondary">{row.released}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${row.mobile === 'Yes' ? 'bg-lxd-success/20 text-lxd-success' : 'bg-muted text-muted-foreground'}`}
                >
                  {row.mobile}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
