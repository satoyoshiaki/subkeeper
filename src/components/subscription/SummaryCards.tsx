'use client';

import { Subscription } from '@/types/subscription';
import { calculateSummary, formatCurrency } from '@/lib/subscription';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface Props {
  subscriptions: Subscription[];
}

export function SummaryCards({ subscriptions }: Props) {
  const summaries = calculateSummary(subscriptions);
  const activeCount = subscriptions.filter(
    (s) => s.status === 'active' || s.status === 'canceling'
  ).length;

  if (summaries.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['月額合計', '年額合計', '実質月額合計'].map((label) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-300 mt-1">—</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        契約中: <strong className="text-gray-900">{activeCount}件</strong>
      </p>
      {summaries.map((summary) => (
        <div key={summary.currency} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar className="h-4 w-4" />
              <p className="text-sm">月額合計</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.monthlyTotal, summary.currency)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <TrendingUp className="h-4 w-4" />
              <p className="text-sm">年額合計</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.yearlyTotal, summary.currency)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <DollarSign className="h-4 w-4" />
              <p className="text-sm font-medium">実質月額合計</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(summary.effectiveMonthlyTotal, summary.currency)}
            </p>
            <p className="text-xs text-blue-500 mt-0.5">月額 + 年額÷12</p>
          </div>
        </div>
      ))}
    </div>
  );
}
