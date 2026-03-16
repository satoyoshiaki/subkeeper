'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Currency, CURRENCY_SYMBOLS } from '@/types/subscription';

export interface ChartDataItem {
  name: string;
  value: number;
}

interface Props {
  data: ChartDataItem[];
  currency: Currency;
}

function formatYAxis(value: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (value >= 10000) return `${symbol}${(value / 10000).toFixed(0)}万`;
  if (value >= 1000) return `${symbol}${(value / 1000).toFixed(0)}k`;
  return `${symbol}${value}`;
}

function formatTooltip(value: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (currency === 'JPY') return `${symbol}${Math.round(value).toLocaleString('ja-JP')}`;
  return `${symbol}${value.toFixed(2)}`;
}

export function CategoryBarChart({ data, currency }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        データがありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#6b7280' }}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          tickFormatter={(v) => formatYAxis(v, currency)}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          width={56}
        />
        <Tooltip
          formatter={(value) => [formatTooltip(Number(value), currency), '月額換算']}
          labelStyle={{ fontWeight: 600, color: '#111827' }}
          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
