import Papa from 'papaparse';
import { Subscription, BillingCycle, Currency, SubscriptionStatus } from '@/types/subscription';

const COLUMNS: (keyof Subscription)[] = [
  'id',
  'serviceName',
  'category',
  'startDate',
  'billingCycle',
  'amount',
  'currency',
  'nextBillingDate',
  'trialEndDate',
  'cancellationDeadline',
  'paymentCard',
  'status',
  'memo',
];

export function exportToCsv(subscriptions: Subscription[]): string {
  const rows = subscriptions.map((sub) =>
    COLUMNS.map((col) => {
      const val = sub[col];
      return val === null ? '' : String(val);
    })
  );
  return Papa.unparse({ fields: COLUMNS as string[], data: rows });
}

export function downloadCsv(subscriptions: Subscription[]): void {
  const csv = exportToCsv(subscriptions);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `subkeeper_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  imported: Subscription[];
  errors: string[];
}

const VALID_BILLING_CYCLES: BillingCycle[] = ['monthly', 'yearly', 'other'];
const VALID_CURRENCIES: Currency[] = ['JPY', 'USD', 'EUR', 'GBP'];
const VALID_STATUSES: SubscriptionStatus[] = ['active', 'canceling', 'canceled'];

export function importFromCsv(csvText: string): ImportResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const imported: Subscription[] = [];
  const errors: string[] = [];

  result.data.forEach((row, index) => {
    const rowNum = index + 2;

    if (!row.id) {
      errors.push(`行${rowNum}: id が空です`);
      return;
    }
    if (!row.serviceName) {
      errors.push(`行${rowNum}: serviceName が空です`);
      return;
    }
    if (!row.startDate) {
      errors.push(`行${rowNum}: startDate が空です`);
      return;
    }

    const billingCycle = row.billingCycle as BillingCycle;
    if (!VALID_BILLING_CYCLES.includes(billingCycle)) {
      errors.push(`行${rowNum}: billingCycle が不正です (${row.billingCycle})`);
      return;
    }

    const currency = row.currency as Currency;
    if (!VALID_CURRENCIES.includes(currency)) {
      errors.push(`行${rowNum}: currency が不正です (${row.currency})`);
      return;
    }

    const status = row.status as SubscriptionStatus;
    if (!VALID_STATUSES.includes(status)) {
      errors.push(`行${rowNum}: status が不正です (${row.status})`);
      return;
    }

    const amount = parseFloat(row.amount);
    if (isNaN(amount)) {
      errors.push(`行${rowNum}: amount が数値ではありません (${row.amount})`);
      return;
    }

    const now = new Date().toISOString();
    imported.push({
      id: row.id,
      serviceName: row.serviceName,
      category: row.category || 'その他',
      startDate: row.startDate,
      billingCycle,
      amount,
      currency,
      nextBillingDate: row.nextBillingDate || null,
      trialEndDate: row.trialEndDate || null,
      cancellationDeadline: row.cancellationDeadline || null,
      paymentCard: row.paymentCard || '',
      status,
      memo: row.memo || '',
      createdAt: now,
      updatedAt: now,
    });
  });

  return { imported, errors };
}
