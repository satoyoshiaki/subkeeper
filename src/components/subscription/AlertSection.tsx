'use client';

import { Subscription } from '@/types/subscription';
import {
  isUpcomingBilling,
  isTrialEndingSoon,
  isCancellationDeadlineSoon,
  getDaysUntil,
} from '@/lib/subscription';
import { AlertTriangle, Calendar } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ja } from 'date-fns/locale';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = parseISO(dateStr);
  if (!isValid(d)) return '—';
  return format(d, 'M月d日', { locale: ja });
}

interface Props {
  subscriptions: Subscription[];
}

export function AlertSection({ subscriptions }: Props) {
  const active = subscriptions.filter((s) => s.status !== 'canceled');
  const upcomingBilling = active.filter(isUpcomingBilling);
  const trialEnding = active.filter(isTrialEndingSoon);
  const cancellationSoon = active.filter(isCancellationDeadlineSoon);

  if (
    upcomingBilling.length === 0 &&
    trialEnding.length === 0 &&
    cancellationSoon.length === 0
  ) {
    return null;
  }

  return (
    <div className="space-y-3">
      {trialEnding.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-orange-700 font-semibold mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span>無料体験まもなく終了（{trialEnding.length}件）</span>
          </div>
          <ul className="space-y-1">
            {trialEnding.map((sub) => (
              <li key={sub.id} className="text-sm text-orange-700 flex justify-between">
                <span>{sub.serviceName}</span>
                <span>
                  終了: {formatDate(sub.trialEndDate)}
                  （あと{getDaysUntil(sub.trialEndDate)}日）
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {cancellationSoon.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-700 font-semibold mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span>解約期限が近い（{cancellationSoon.length}件）</span>
          </div>
          <ul className="space-y-1">
            {cancellationSoon.map((sub) => (
              <li key={sub.id} className="text-sm text-red-700 flex justify-between">
                <span>{sub.serviceName}</span>
                <span>
                  期限: {formatDate(sub.cancellationDeadline)}
                  （あと{getDaysUntil(sub.cancellationDeadline)}日）
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {upcomingBilling.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
            <Calendar className="h-4 w-4" />
            <span>まもなく請求（{upcomingBilling.length}件）</span>
          </div>
          <ul className="space-y-1">
            {upcomingBilling.map((sub) => (
              <li key={sub.id} className="text-sm text-blue-700 flex justify-between">
                <span>{sub.serviceName}</span>
                <span>
                  請求: {formatDate(sub.nextBillingDate)}
                  （あと{getDaysUntil(sub.nextBillingDate)}日）
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
