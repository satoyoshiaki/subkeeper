'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieLabelRenderProps,
} from 'recharts';
import { Currency, CURRENCY_SYMBOLS } from '@/types/subscription';
import { ChartDataItem } from './CategoryBarChart';

interface Props {
  data: ChartDataItem[];
  currency: Currency;
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#f97316',
  '#6b7280',
];

function formatTooltip(value: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (currency === 'JPY') return `${symbol}${Math.round(value).toLocaleString('ja-JP')}`;
  return `${symbol}${value.toFixed(2)}`;
}

function renderCustomLabel(props: PieLabelRenderProps) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (!percent || percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const ir = Number(innerRadius ?? 0);
  const or = Number(outerRadius ?? 0);
  const ma = Number(midAngle ?? 0);
  const radius = ir + (or - ir) * 0.5;
  const x = Number(cx ?? 0) + radius * Math.cos(-ma * RADIAN);
  const y = Number(cy ?? 0) + radius * Math.sin(-ma * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function CategoryPieChart({ data, currency }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        データがありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          outerRadius={100}
          labelLine={false}
          label={renderCustomLabel}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [formatTooltip(Number(value), currency), '月額換算']}
          contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Legend
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
