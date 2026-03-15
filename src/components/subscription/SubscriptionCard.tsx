'use client';

import { Subscription, BILLING_CYCLE_LABELS, STATUS_LABELS } from '@/types/subscription';
import {
  formatCurrency,
  getDaysUntil,
  isUpcomingBilling,
  isTrialEndingSoon,
  isCancellationDeadlineSoon,
} from '@/lib/subscription';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, CreditCard, Calendar, AlertTriangle } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { ja } from 'date-fns/locale';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = parseISO(dateStr);
  if (!isValid(d)) return '—';
  return format(d, 'yyyy/MM/dd', { locale: ja });
}

const statusStyles: Record<string, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  canceling: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  canceled: 'bg-gray-100 text-gray-500 border-gray-200',
};

interface Props {
  subscription: Subscription;
  onEdit: (sub: Subscription) => void;
  onDelete: (sub: Subscription) => void;
}

export function SubscriptionCard({ subscription: sub, onEdit, onDelete }: Props) {
  const upcomingBilling = isUpcomingBilling(sub);
  const trialEnding = isTrialEndingSoon(sub);
  const cancellationSoon = isCancellationDeadlineSoon(sub);
  const hasWarning = upcomingBilling || trialEnding || cancellationSoon;

  return (
    <div
      className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-shadow ${
        hasWarning ? 'border-orange-300' : 'border-gray-200'
      } ${sub.status === 'canceled' ? 'opacity-60' : ''}`}
    >
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 truncate">{sub.serviceName}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusStyles[sub.status]}`}
            >
              {STATUS_LABELS[sub.status]}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{sub.category}</p>
        </div>
        <div className="flex gap-1 ml-2 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(sub)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(sub)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 金額 */}
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-bold text-gray-900">
          {formatCurrency(sub.amount, sub.currency)}
        </span>
        <span className="text-sm text-gray-500">/ {BILLING_CYCLE_LABELS[sub.billingCycle]}</span>
      </div>

      {/* 詳細 */}
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>
            次回請求:{' '}
            <span className={`font-medium ${upcomingBilling ? 'text-orange-600' : 'text-gray-900'}`}>
              {formatDate(sub.nextBillingDate)}
            </span>
            {upcomingBilling && sub.nextBillingDate && (
              <span className="ml-1 text-orange-600">
                （あと{getDaysUntil(sub.nextBillingDate)}日）
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <CreditCard className="h-3.5 w-3.5 shrink-0" />
          <span>{sub.paymentCard || '—'}</span>
        </div>
      </div>

      {/* 警告バッジ */}
      {hasWarning && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {trialEnding && (
            <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-700 border border-orange-200 rounded-full px-2 py-0.5 font-medium">
              <AlertTriangle className="h-3 w-3" />
              無料体験終了 {formatDate(sub.trialEndDate)}
            </span>
          )}
          {cancellationSoon && (
            <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 border border-red-200 rounded-full px-2 py-0.5 font-medium">
              <AlertTriangle className="h-3 w-3" />
              解約期限 {formatDate(sub.cancellationDeadline)}
            </span>
          )}
          {upcomingBilling && !trialEnding && !cancellationSoon && (
            <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 font-medium">
              <Calendar className="h-3 w-3" />
              請求が近い
            </span>
          )}
        </div>
      )}

      {/* メモ */}
      {sub.memo && (
        <p className="mt-2 text-xs text-gray-400 truncate">{sub.memo}</p>
      )}
    </div>
  );
}
