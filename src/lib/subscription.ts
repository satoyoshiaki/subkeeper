import { differenceInDays, parseISO, isValid } from 'date-fns';
import { Subscription, Currency, CURRENCY_SYMBOLS } from '@/types/subscription';

export function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const date = parseISO(dateStr);
  if (!isValid(date)) return null;
  return differenceInDays(date, new Date());
}

export function isUpcomingBilling(sub: Subscription, days = 7): boolean {
  if (!sub.nextBillingDate) return false;
  const d = getDaysUntil(sub.nextBillingDate);
  return d !== null && d >= 0 && d <= days;
}

export function isTrialEndingSoon(sub: Subscription, days = 3): boolean {
  if (!sub.trialEndDate) return false;
  const d = getDaysUntil(sub.trialEndDate);
  return d !== null && d >= 0 && d <= days;
}

export function isCancellationDeadlineSoon(sub: Subscription, days = 3): boolean {
  if (!sub.cancellationDeadline) return false;
  const d = getDaysUntil(sub.cancellationDeadline);
  return d !== null && d >= 0 && d <= days;
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  if (currency === 'JPY') {
    return `${symbol}${Math.round(amount).toLocaleString('ja-JP')}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}

export interface Summary {
  currency: Currency;
  monthlyTotal: number;
  yearlyTotal: number;
  effectiveMonthlyTotal: number;
}

export function calculateSummary(subscriptions: Subscription[]): Summary[] {
  const active = subscriptions.filter(
    (s) => s.status === 'active' || s.status === 'canceling'
  );

  const byCurrency = new Map<Currency, Summary>();

  for (const sub of active) {
    if (!byCurrency.has(sub.currency)) {
      byCurrency.set(sub.currency, {
        currency: sub.currency,
        monthlyTotal: 0,
        yearlyTotal: 0,
        effectiveMonthlyTotal: 0,
      });
    }
    const summary = byCurrency.get(sub.currency)!;
    if (sub.billingCycle === 'monthly') {
      summary.monthlyTotal += sub.amount;
      summary.effectiveMonthlyTotal += sub.amount;
    } else if (sub.billingCycle === 'yearly') {
      summary.yearlyTotal += sub.amount;
      summary.effectiveMonthlyTotal += sub.amount / 12;
    }
  }

  return Array.from(byCurrency.values());
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sample-1',
    serviceName: 'Netflix',
    category: '動画配信',
    startDate: '2024-01-01',
    billingCycle: 'monthly',
    amount: 1490,
    currency: 'JPY',
    nextBillingDate: daysFromNow(3),
    trialEndDate: null,
    cancellationDeadline: null,
    paymentCard: '三井住友カード',
    status: 'active',
    memo: 'スタンダード',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-2',
    serviceName: 'Spotify',
    category: '音楽',
    startDate: '2024-03-01',
    billingCycle: 'monthly',
    amount: 980,
    currency: 'JPY',
    nextBillingDate: daysFromNow(10),
    trialEndDate: daysFromNow(2),
    cancellationDeadline: null,
    paymentCard: '楽天カード',
    status: 'active',
    memo: 'プレミアム',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-3',
    serviceName: 'Adobe Creative Cloud',
    category: 'ソフトウェア',
    startDate: '2023-06-01',
    billingCycle: 'yearly',
    amount: 72336,
    currency: 'JPY',
    nextBillingDate: daysFromNow(45),
    trialEndDate: null,
    cancellationDeadline: daysFromNow(2),
    paymentCard: '三井住友カード',
    status: 'canceling',
    memo: 'フォトプラン',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-4',
    serviceName: 'YouTube Premium',
    category: '動画配信',
    startDate: '2022-01-01',
    billingCycle: 'monthly',
    amount: 1280,
    currency: 'JPY',
    nextBillingDate: daysFromNow(20),
    trialEndDate: null,
    cancellationDeadline: null,
    paymentCard: '楽天カード',
    status: 'active',
    memo: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sample-5',
    serviceName: 'Amazon Prime',
    category: 'ショッピング',
    startDate: '2021-04-01',
    billingCycle: 'yearly',
    amount: 5900,
    currency: 'JPY',
    nextBillingDate: daysFromNow(90),
    trialEndDate: null,
    cancellationDeadline: null,
    paymentCard: '三井住友カード',
    status: 'active',
    memo: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
