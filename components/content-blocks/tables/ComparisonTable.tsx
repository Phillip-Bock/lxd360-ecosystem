'use client';

import { Check, X } from 'lucide-react';

export function ComparisonTable(): React.JSX.Element {
  const data = [
    { feature: 'User Accounts', basic: '1', pro: '10', enterprise: 'Unlimited' },
    { feature: 'Cloud Storage', basic: '10 GB', pro: '100 GB', enterprise: 'Unlimited' },
    { feature: 'Mobile Support', basic: false, pro: true, enterprise: true },
    { feature: '24/7 Support', basic: false, pro: false, enterprise: true },
  ];

  const renderCell = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-lxd-success mx-auto" />
      ) : (
        <X className="w-5 h-5 text-lxd-error mx-auto" />
      );
    }
    return value;
  };

  return (
    <div className="bg-card dark:bg-lxd-dark-page rounded-2xl shadow-lg p-8">
      <h4 className="text-lg font-semibold text-lxd-blue mb-4">Comparison Table</h4>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted dark:bg-lxd-dark-surface">
            <th className="text-left p-3 text-lxd-text-dark-heading dark:text-lxd-text-light-heading">
              Feature
            </th>
            <th className="text-left p-3 text-lxd-text-dark-heading dark:text-lxd-text-light-heading">
              Basic Plan
            </th>
            <th className="text-left p-3 text-lxd-text-dark-heading dark:text-lxd-text-light-heading">
              Pro Plan
            </th>
            <th className="text-left p-3 text-lxd-text-dark-heading dark:text-lxd-text-light-heading">
              Enterprise Plan
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="border-b border-border dark:border-lxd-dark-surface">
              <td className="p-3 text-lxd-text-dark-body dark:text-lxd-text-light-heading">
                {row.feature}
              </td>
              <td className="p-3 text-center text-lxd-text-dark-secondary dark:text-lxd-text-light-secondary">
                {renderCell(row.basic)}
              </td>
              <td className="p-3 text-center text-lxd-text-dark-secondary dark:text-lxd-text-light-secondary">
                {renderCell(row.pro)}
              </td>
              <td className="p-3 text-center text-lxd-text-dark-secondary dark:text-lxd-text-light-secondary">
                {renderCell(row.enterprise)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
