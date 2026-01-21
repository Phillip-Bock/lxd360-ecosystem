import { Section } from '@react-email/components';
import type * as React from 'react';
import { theme } from '../theme';

// ============================================================================
// TYPES
// ============================================================================

export interface TableColumn {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface EmailTableProps {
  columns: TableColumn[];
  data: Record<string, React.ReactNode>[];
  style?: React.CSSProperties;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function EmailTable({ columns, data, style }: EmailTableProps) {
  return (
    <Section
      style={{
        margin: `${theme.spacing[4]} 0`,
        ...style,
      }}
    >
      <table
        style={{
          ...theme.styles.table.container,
          borderCollapse: 'collapse',
        }}
      >
        {/* Header Row */}
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  ...theme.styles.table.header,
                  textAlign: col.align || 'left',
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Data Rows */}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    ...theme.styles.table.cell,
                    textAlign: col.align || 'left',
                  }}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
}

// ============================================================================
// ORDER SUMMARY TABLE
// ============================================================================

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderSummaryProps {
  items: OrderItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  currency?: string;
}

export function OrderSummary({
  items,
  subtotal,
  tax,
  discount,
  total,
  currency = 'USD',
}: OrderSummaryProps) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });

  return (
    <Section
      style={{
        margin: `${theme.spacing[4]} 0`,
      }}
    >
      <table
        style={{
          ...theme.styles.table.container,
          borderCollapse: 'collapse',
        }}
      >
        {/* Header */}
        <thead>
          <tr style={{ backgroundColor: theme.colors.gray[50] }}>
            <th style={{ ...theme.styles.table.header, textAlign: 'left' }}>Item</th>
            <th style={{ ...theme.styles.table.header, textAlign: 'center', width: '60px' }}>
              Qty
            </th>
            <th style={{ ...theme.styles.table.header, textAlign: 'right', width: '100px' }}>
              Price
            </th>
          </tr>
        </thead>

        {/* Items */}
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td style={{ ...theme.styles.table.cell, textAlign: 'left' }}>{item.name}</td>
              <td style={{ ...theme.styles.table.cell, textAlign: 'center' }}>{item.quantity}</td>
              <td style={{ ...theme.styles.table.cell, textAlign: 'right' }}>
                {formatter.format(item.price)}
              </td>
            </tr>
          ))}
        </tbody>

        {/* Summary */}
        <tfoot>
          <tr>
            <td
              colSpan={2}
              style={{
                ...theme.styles.table.cell,
                textAlign: 'right',
                borderBottom: 'none',
              }}
            >
              Subtotal:
            </td>
            <td
              style={{
                ...theme.styles.table.cell,
                textAlign: 'right',
                borderBottom: 'none',
              }}
            >
              {formatter.format(subtotal)}
            </td>
          </tr>

          {discount !== undefined && discount > 0 && (
            <tr>
              <td
                colSpan={2}
                style={{
                  ...theme.styles.table.cell,
                  textAlign: 'right',
                  borderBottom: 'none',
                  color: theme.colors.success,
                }}
              >
                Discount:
              </td>
              <td
                style={{
                  ...theme.styles.table.cell,
                  textAlign: 'right',
                  borderBottom: 'none',
                  color: theme.colors.success,
                }}
              >
                -{formatter.format(discount)}
              </td>
            </tr>
          )}

          {tax !== undefined && (
            <tr>
              <td
                colSpan={2}
                style={{
                  ...theme.styles.table.cell,
                  textAlign: 'right',
                  borderBottom: 'none',
                }}
              >
                Tax:
              </td>
              <td
                style={{
                  ...theme.styles.table.cell,
                  textAlign: 'right',
                  borderBottom: 'none',
                }}
              >
                {formatter.format(tax)}
              </td>
            </tr>
          )}

          <tr style={{ backgroundColor: theme.colors.gray[50] }}>
            <td
              colSpan={2}
              style={{
                padding: theme.spacing[3],
                textAlign: 'right',
                fontWeight: theme.typography.weights.bold,
                fontSize: theme.typography.sizes.base,
              }}
            >
              Total:
            </td>
            <td
              style={{
                padding: theme.spacing[3],
                textAlign: 'right',
                fontWeight: theme.typography.weights.bold,
                fontSize: theme.typography.sizes.base,
              }}
            >
              {formatter.format(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </Section>
  );
}

export default EmailTable;
