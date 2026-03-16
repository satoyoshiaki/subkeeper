'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { createSupabaseRepository } from '@/lib/supabase/repository';
import { Subscription, Currency, CURRENCY_SYMBOLS } from '@/types/subscription';
import { CategoryBarChart } from '@/components/analytics/CategoryBarChart';
import { CardBarChart } from '@/components/analytics/CardBarChart';
import { CategoryPieChart } from '@/components/analytics/CategoryPieChart';

function getEffectiveMonthly(sub: Subscription): number {
  if (sub.billingCycle === 'monthly') return sub.amount;
  if (sub.billingCycle === 'yearly') return sub.amount / 12;
  return sub.amount;
}

interface CurrencyData {
  currency: Currency;
  categoryData: { name: string; value: number }[];
  cardData: { name: string; value: number }[];
  totalMonthly: number;
}

function computeChartData(subscriptions: Subscription[]): CurrencyData[] {
  const active = subscriptions.filter((s) => s.status !== 'canceled');
  const byCurrency = new Map<Currency, { category: Map<string, number>; card: Map<string, number> }>();

  for (const sub of active) {
    if (!byCurrency.has(sub.currency)) {
      byCurrency.set(sub.currency, { category: new Map(), card: new Map() });
    }
    const group = byCurrency.get(sub.currency)!;
    const monthly = getEffectiveMonthly(sub);

    group.category.set(sub.category, (group.category.get(sub.category) ?? 0) + monthly);

    const card = sub.paymentCard || '未設定';
    group.card.set(card, (group.card.get(card) ?? 0) + monthly);
  }

  return Array.from(byCurrency.entries()).map(([currency, { category, card }]) => {
    const categoryData = Array.from(category.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);

    const cardData = Array.from(card.entries())
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);

    const totalMonthly = categoryData.reduce((sum, d) => sum + d.value, 0);

    return { currency, categoryData, cardData, totalMonthly };
  });
}

export default function AnalyticsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      createSupabaseRepository(supabase, user.id)
        .getAllAsync()
        .then(setSubscriptions);
    });
  }, []);

  const chartDataList = useMemo(() => computeChartData(subscriptions), [subscriptions]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">集計・分析</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        {subscriptions.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            <BarChart2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">データがありません</h3>
            <p className="text-gray-500">ダッシュボードでサブスクを追加してください</p>
          </div>
        ) : (
          chartDataList.map(({ currency, categoryData, cardData, totalMonthly }) => {
            const symbol = CURRENCY_SYMBOLS[currency];
            const formattedTotal =
              currency === 'JPY'
                ? `${symbol}${Math.round(totalMonthly).toLocaleString('ja-JP')}`
                : `${symbol}${totalMonthly.toFixed(2)}`;

            return (
              <div key={currency} className="space-y-6">
                {chartDataList.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {currency} 合計
                    </span>
                    <span className="text-lg font-bold text-gray-900">{formattedTotal} / 月</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">カテゴリ別 月額換算</h3>
                    <CategoryBarChart data={categoryData} currency={currency} />
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">カード別 月額換算</h3>
                    <CardBarChart data={cardData} currency={currency} />
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">
                    カテゴリ別 シェア（月額換算）
                  </h3>
                  <CategoryPieChart data={categoryData} currency={currency} />
                </div>

                <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-5 text-white shadow-sm">
                  <p className="text-blue-100 text-sm mb-1">月額換算 合計（アクティブ）</p>
                  <p className="text-3xl font-bold">{formattedTotal}</p>
                  <p className="text-blue-100 text-sm mt-1">
                    年間換算：{
                      currency === 'JPY'
                        ? `${symbol}${Math.round(totalMonthly * 12).toLocaleString('ja-JP')}`
                        : `${symbol}${(totalMonthly * 12).toFixed(2)}`
                    }
                  </p>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
